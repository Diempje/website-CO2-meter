/**
 * Main Application Logic - Website CO2 Meter ENHANCED
 * Performance Score Focus + Visitor Impact + Enhanced UI
 */

// Application state
const AppState = {
    isAnalyzing: false,
    currentResults: null,
    analysisHistory: [],
    selectedVisitorScale: 10000 // Default to 10K visitors
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
    
    console.log('🌱 CO2 Meter App initialized - Enhanced Version');
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
 * Generate PROMINENT Performance Score HTML - MAIN FOCUS
 * @param {Object} data - Analysis results
 * @returns {string} HTML string
 */
function generatePerformanceHeroHTML(data) {
    const gradeColor = Utils.getGradeColor(data.grade);
    const performanceBenchmark = data.benchmarks.performance;
    const co2Benchmark = data.benchmarks.co2;
    
    return `
        <div class="performance-hero">
            <div class="performance-score-display">
                <div class="grade-display" style="color: ${gradeColor};">
                    ${data.grade}
                </div>
                <div class="score-display">
                    <span class="score-number">${data.performanceScore}</span>
                    <span class="score-label">/100</span>
                </div>
                <div class="performance-subtitle">
                    Dit is ${performanceBenchmark.percentage}% ${performanceBenchmark.percentage > 0 && data.performanceScore >= 65 ? 'beter' : 'slechter'} dan het gemiddelde van ${co2Benchmark.average}g CO2 per pagina bezoek
                </div>
            </div>
            <div class="performance-context">
                <div class="context-item">
                    <span class="context-icon">🌱</span>
                    <span class="context-text">${Utils.formatCO2(data.co2PerVisit)} CO2 per bezoek</span>
                </div>
                <div class="context-item">
                    <span class="context-icon">📊</span>
                    <span class="context-text">${Utils.formatBytes(data.transferSize * 1024)} pagina grootte</span>
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
 * Generate ALL environmental comparisons HTML (no dropdown)
 * @param {Array} comparisons - Array of comparison objects
 * @returns {string} HTML string
 */
function generateAllComparisonsHTML(comparisons) {
    return `
        <div class="comparison-section">
            <h4>🌍 Milieu Impact Vergelijkingen</h4>
            <div class="comparison-grid">
                ${comparisons.map(comp => `
                    <div class="comparison-item">
                        <span class="comparison-icon">${comp.icon}</span>
                        <span class="comparison-text">${comp.text}</span>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
}

/**
 * Generate visitor impact scaling HTML
 * @param {Array} visitorImpact - Visitor impact data
 * @param {number} selectedScale - Currently selected scale
 * @returns {string} HTML string
 */
function generateVisitorImpactHTML(visitorImpact, selectedScale) {
    return `
        <div class="visitor-impact-section">
            <h4>👥 Impact bij Verschillende Bezoekers Aantallen</h4>
            <p class="visitor-intro">Zie hoe de milieu-impact schaalt met meer website bezoekers per maand:</p>
            
            <div class="visitor-scales">
                ${visitorImpact.map((scale, index) => `
                    <div class="visitor-scale-card ${scale.visitors === selectedScale ? 'active' : ''}" 
                         onclick="updateVisitorScale(${scale.visitors})" 
                         tabindex="0">
                        <div class="visitor-count">
                            <strong>${scale.label}</strong>
                            <span class="visitor-co2">${Utils.formatCO2(scale.totalCO2Monthly)} per maand</span>
                        </div>
                        <div class="visitor-yearly">
                            <strong>${scale.totalCO2Yearly}kg CO2 per jaar</strong>
                        </div>
                        <div class="visitor-comparisons">
                            <div class="visitor-comp-item">
                                <span class="comp-icon">🌳</span>
                                <span>${scale.treesNeeded} bomen nodig voor compensatie</span>
                            </div>
                            <div class="visitor-comp-item">
                                <span class="comp-icon">🚗</span>
                                <span>${scale.kmDriving}km autorijden equivalent</span>
                            </div>
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
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
            case 'excellent': return '🏆';
            case 'good': return '✅';
            case 'average': return '⚖️';
            case 'poor': return '⚠️';
            default: return '📊';
        }
    };
    
    const getStatusColor = (status) => {
        switch(status) {
            case 'excellent': return 'var(--success-color)';
            case 'good': return 'var(--accent-green)';
            case 'average': return 'var(--warning-color)';
            case 'poor': return 'var(--error-color)';
            default: return 'var(--text-muted)';
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
            <h4>📊 Benchmark Vergelijkingen</h4>
            <div class="benchmark-grid">
                ${benchmarkItems.map(item => `
                    <div class="benchmark-item ${item.data.status}">
                        <div class="benchmark-metric">
                            <span class="benchmark-label">${item.label}</span>
                            <span class="benchmark-value" style="color: ${getStatusColor(item.data.status)}">
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
            icon: '✅',
            label: 'CO2 per bezoek',
            value: Utils.formatCO2(data.co2PerVisit)
        },
        {
            icon: '📁',
            label: 'Website grootte',
            value: Utils.formatBytes(data.transferSize * 1024)
        },
        {
            icon: '🖼️',
            label: 'Afbeelding optimalisatie',
            value: `${Math.round(data.optimizations.imageOptimizationScore * 100)}/100`
        }
    ];
    
    // Add optional metrics if available
    if (data.domElements) {
        metrics.push({
            icon: '🏠',
            label: 'DOM elementen',
            value: data.domElements.toLocaleString('nl-NL')
        });
    }
    
    if (data.httpRequests) {
        metrics.push({
            icon: '📡',
            label: 'HTTP requests',
            value: data.httpRequests.toLocaleString('nl-NL')
        });
    }
    
    // Add potential savings if significant
    if (data.optimizations.canSave > 5) {
        metrics.push({
            icon: '💾',
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
 * Generate optimization tips HTML
 * @param {Object} optimizations - Optimization data
 * @returns {string} HTML string
 */
function generateOptimizationTipsHTML(optimizations) {
    if (optimizations.canSave <= 5) return ''; // Don't show tips if savings are minimal
    
    const co2Savings = Math.round((optimizations.canSave / 1024) * 0.8 * 100) / 100; // Rough estimate
    
    return `
        <div class="tip-box">
            <span class="tip-icon">💡</span>
            <strong>Optimalisatie Tip:</strong> 
            Je kunt ${Utils.formatBytes(optimizations.canSave * 1024)} besparen door ongebruikte code te verwijderen!
            Dit zou de CO2 uitstoot met ongeveer ${co2Savings}g kunnen verminderen per bezoek.
            ${optimizations.unusedCSS > 0 ? `<br>• ${optimizations.unusedCSS}KB ongebruikte CSS` : ''}
            ${optimizations.unusedJS > 0 ? `<br>• ${optimizations.unusedJS}KB ongebruikte JavaScript` : ''}
        </div>
    `;
}

/**
 * Update visitor scale selection
 * @param {number} visitors - Number of visitors
 */
function updateVisitorScale(visitors) {
    AppState.selectedVisitorScale = visitors;
    
    if (AppState.currentResults) {
        // Add smooth transition
        const visitorSection = document.querySelector('.visitor-impact-section');
        if (visitorSection) {
            visitorSection.style.opacity = '0.7';
            
            setTimeout(() => {
                visitorSection.outerHTML = generateVisitorImpactHTML(
                    AppState.currentResults.visitorImpact, 
                    AppState.selectedVisitorScale
                );
                
                // Restore opacity
                const newVisitorSection = document.querySelector('.visitor-impact-section');
                if (newVisitorSection) {
                    newVisitorSection.style.opacity = '1';
                }
            }, 150);
        }
    }
}

/**
 * Display analysis results with PERFORMANCE FOCUS
 * @param {Object} data - Analysis results
 */
function displayResults(data) {
    const displayUrl = Utils.formatURLForDisplay(data.url);
    const comparisons = Utils.getEnvironmentalComparison(data.co2PerVisit);
    
    DOM.resultsContainer.innerHTML = `
        <div class="result-card">
            <h3>🌱 Analyse Resultaten voor: ${Utils.sanitizeHTML(displayUrl)}</h3>
            
            ${generatePerformanceHeroHTML(data)}
            
            ${generateHostingStatusHTML(data.greenHosting)}
            
            ${generateDetailedMetricsHTML(data)}
            
            ${generateEnhancedBenchmarkHTML(data.benchmarks)}
            
            ${generateAllComparisonsHTML(comparisons)}
            
            ${generateVisitorImpactHTML(data.visitorImpact, AppState.selectedVisitorScale)}
            
            ${generateOptimizationTipsHTML(data.optimizations)}
            
            <div class="result-actions">
                <button onclick="shareResults()" class="share-btn">📤 Deel Resultaten</button>
                <button onclick="analyzeAnother()" class="secondary-btn">🔄 Analyseer Andere Website</button>
            </div>
        </div>
    `;
    
    // Scroll to results for better UX
    setTimeout(() => {
        Utils.scrollTo('.result-card', 100);
    }, 100);
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
 * Share results functionality with enhanced data
 */
async function shareResults() {
    if (!AppState.currentResults) return;
    
    const selectedImpact = AppState.currentResults.visitorImpact.find(
        scale => scale.visitors === AppState.selectedVisitorScale
    ) || AppState.currentResults.visitorImpact[1];
    
    const shareText = `🌱 Website CO2 Analyse van ${AppState.currentResults.url}:

📊 Performance Score: ${AppState.currentResults.performanceScore}/100 (${AppState.currentResults.grade})
✅ CO2 uitstoot: ${Utils.formatCO2(AppState.currentResults.co2PerVisit)} per bezoek
📁 Website grootte: ${Utils.formatBytes(AppState.currentResults.transferSize * 1024)}

👥 Bij ${selectedImpact.label}:
🌳 ${selectedImpact.treesNeeded} bomen nodig voor compensatie
🚗 ${selectedImpact.kmDriving}km autorijden equivalent

${AppState.currentResults.greenHosting.isGreen ? '🌱 Gebruikt groene hosting!' : '⚡ Gebruikt grijze hosting'}

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
                shareBtn.innerHTML = '✅ Gekopieerd naar klembord!';
                setTimeout(() => {
                    shareBtn.innerHTML = originalText;
                }, 3000);
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
    
    // Reset visitor scale to default
    AppState.selectedVisitorScale = 10000;
}

// Make functions globally available
window.updateVisitorScale = updateVisitorScale;
window.shareResults = shareResults;
window.analyzeAnother = analyzeAnother;

// Initialize app when DOM is loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
} else {
    initApp();
}