/**
 * Main Application Logic - Website CO2 Meter ENHANCED
 * Combined Environmental Impact Calculator with Visitor Scaling
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
    
    console.log('Yas, we zijn live jonges!');
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
    Utils.showLoading(DOM.resultsContainer, 'Website wordt geanalyseerd... Dit kan 5-10 seconden duren, afhankelijk van de grootte van de website.');
    
    try {
        // Call API
        const results = await API.analyzeWebsite(url);
        
        // Store results
        AppState.currentResults = results;
        AppState.analysisHistory.unshift(results);
        
        // Display results
        displayResults(results);
        
        console.log('Analyse afgerond:', results);
        
    } catch (error) {
        console.error('Oh neen toch! De analyse is mislukt:', error);
        showError(error.message || 'Oops, er ging iets mis tijdens de analyse. Probeer het later opnieuw.');
        
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
                <div class="context-item context-text">
                    ${Utils.icons.co2}
                    ${Utils.formatCO2(data.co2PerVisit)} CO2 per bezoek
                </div>
                <div class="context-item">
                    ${Utils.icons.pageIcon}
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
    const statusIcon = greenHosting.isGreen ? `${Utils.icons.greenHosting}` : `${Utils.icons.greyHosting}`;
    const statusTitle = greenHosting.isGreen ? 'Groene Hosting!' : 'Oh neen, je hosting is grijs!';
    
    return `
        <div class="hosting-status ${statusClass}">
            <h4>${statusIcon} ${statusTitle}</h4>
            <p>Provider: ${Utils.sanitizeHTML(greenHosting.provider)}</p>
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
                    <select id="visitorSelect" onchange="updateImpactCalculation(this.value)" class="visitor-dropdown">
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
 * Generate optimization tips HTML
 * @param {Object} optimizations - Optimization data
 * @returns {string} HTML string
 */
function generateOptimizationTipsHTML(optimizations) {
    if (optimizations.canSave <= 5) return ''; // Don't show tips if savings are minimal
    
    const co2Savings = Math.round((optimizations.canSave / 1024) * 0.8 * 100) / 100; // Rough estimate
    
    return `
        <div class="tip-box">
            <span class="tip-icon">${Utils.icons.ledIcon}</span>
            <strong>Optimalisatie Tip:</strong> 
            Je kunt ${Utils.formatBytes(optimizations.canSave * 1024)} besparen door ongebruikte code te verwijderen!
            Dit zou de CO2 uitstoot met ongeveer ${co2Savings}g kunnen verminderen per bezoek.
            ${optimizations.unusedCSS > 0 ? `<br>• ${optimizations.unusedCSS}KB ongebruikte CSS` : ''}
            ${optimizations.unusedJS > 0 ? `<br>• ${optimizations.unusedJS}KB ongebruikte JavaScript` : ''}
        </div>
    `;
}

/**
 * Display analysis results with COMBINED IMPACT CALCULATOR
 * @param {Object} data - Analysis results
 */
function displayResults(data) {
    const displayUrl = Utils.formatURLForDisplay(data.url);
    
    DOM.resultsContainer.innerHTML = `
        <div class="result-card">
            <h3>${Utils.icons.bulletPoint} Analyse resultaten voor: ${Utils.sanitizeHTML(displayUrl)}</h3>
            
            ${generatePerformanceHeroHTML(data)}
            
            ${generateHostingStatusHTML(data.greenHosting)}
            
            ${generateDetailedMetricsHTML(data)}
            
            ${generateEnhancedBenchmarkHTML(data.benchmarks)}
            
            ${generateCombinedImpactCalculatorHTML(data.co2PerVisit, AppState.selectedVisitorScale)}
            
            ${generateOptimizationTipsHTML(data.optimizations)}
            
            <div class="result-actions">
                <button onclick="shareResults()" class="share-btn">${Utils.icons.shareIcon} Deel resultaten</button>
                <button onclick="analyzeAnother()" class="secondary-btn">${Utils.icons.analyseerIcon} Analyseer een andere website</button>
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
            <h3>Er ging iets mis</h3>
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
    
    const monthlyCO2 = AppState.currentResults.co2PerVisit * AppState.selectedVisitorScale;
    const yearlyCO2 = monthlyCO2 * 12;
    const treesNeeded = Math.max(1, Math.round((yearlyCO2 / 1000) / 22));
    const kmDriving = Math.round((monthlyCO2 / 404) * 100) / 100;
    
    const shareText = `🌱 Website CO2 Analyse van ${AppState.currentResults.url}:

📊 Performance Score: ${AppState.currentResults.performanceScore}/100 (${AppState.currentResults.grade})
✅ CO2 uitstoot: ${Utils.formatCO2(AppState.currentResults.co2PerVisit)} per bezoek
📁 Website grootte: ${Utils.formatBytes(AppState.currentResults.transferSize * 1024)}

👥 Bij ${AppState.selectedVisitorScale.toLocaleString('nl-NL')} bezoekers/maand:
🌍 ${Utils.formatCO2(yearlyCO2)} CO2 per jaar
🌳 ${treesNeeded} bomen nodig voor compensatie
🚗 ${kmDriving}km autorijden equivalent per maand

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
window.updateImpactCalculation = updateImpactCalculation;
window.shareResults = shareResults;
window.analyzeAnother = analyzeAnother;

// Initialize app when DOM is loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
} else {
    initApp();
}

// DEVELOPMENT ONLY - Auto-load test data
const TEST_DATA = {
    url: "https://example.com",
    co2PerVisit: 2.5,
    transferSize: 1500,
    performanceScore: 78,
    grade: "B+",
    domElements: 1200,
    httpRequests: 45,
    greenHosting: {
        isGreen: true,
        provider: "Green Hosting Provider",
        impact: "Lagere CO2 impact door groene energie!"
    },
    optimizations: {
        imageOptimizationScore: 0.85,
        unusedCSS: 25,
        unusedJS: 40,
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

// Auto-load test data op localhost
function autoLoadTestData() {
    if (window.location.hostname === 'localhost' || window.location.hostname.includes('127.0.0.1')) {
        setTimeout(() => {
            AppState.currentResults = TEST_DATA;
            displayResults(TEST_DATA);
            console.log('🧪 Test data automatically loaded for development');
        }, 500);
    }
}

// Auto-load na app initialization
setTimeout(autoLoadTestData, 100);