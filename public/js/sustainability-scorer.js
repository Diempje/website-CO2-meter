/**
 * SUSTAINABILITY SCORER MODULE
 * File: public/js/sustainability-scorer.js
 * 
 * Evidence-based sustainability scoring system voor websites
 * Vervangt Google Performance Grade met echte milieu-impact score
 */

const SustainabilityScorer = {
    /**
     * HOOFDFUNCTIE: Bereken complete sustainability score
     * @param {Object} data - Alle beschikbare website data
     * @returns {Object} Sustainability score + breakdown
     */
    calculateSustainabilityScore(data) {
        const factors = this.calculateAllFactors(data);
        
        // EVIDENCE-BASED WEIGHTING - Gebaseerd op SWDM v4 en industry research
        const weightedScore = 
            (factors.dataEfficiency.score * 0.35) +      // 35% - Primaire factor in alle methodologies
            (factors.resourceCount.score * 0.20) +       // 20% - HTTP requests & DOM impact bewezen
            (factors.greenHosting.score * 0.15) +        // 15% - 14% emissiereductie bewezen (Mightybytes)
            (factors.mediaOptimization.score * 0.12) +   // 12% - Afbeeldingen grootste component page size
            (factors.codeEfficiency.score * 0.08) +      // 8%  - Ongebruikte code waste
            (factors.loadingEfficiency.score * 0.07) +   // 7%  - Performance → minder reloads
            (factors.userExperience.score * 0.03);       // 3%  - Secondary effect op energy
        
        const finalScore = Math.round(weightedScore);
        const grade = this.getGrade(finalScore);
        
        return {
            sustainabilityScore: finalScore,
            grade: grade,
            breakdown: factors,
            insights: this.generateInsights(factors, finalScore)
        };
    },

    /**
     * Bereken alle individuele factors
     */
    calculateAllFactors(data) {
        return {
            // DIRECT MILIEU IMPACT (70%)
            dataEfficiency: this.calculateDataEfficiency(data),
            resourceCount: this.calculateResourceCount(data), 
            mediaOptimization: this.calculateMediaOptimization(data),
            codeEfficiency: this.calculateCodeEfficiency(data),
            
            // PERFORMANCE IMPACT (10%) 
            loadingEfficiency: this.calculateLoadingEfficiency(data),
            userExperience: this.calculateUserExperience(data),
            
            // INFRASTRUCTURE (15%)
            greenHosting: this.calculateGreenHosting(data)
        };
    },

    /**
     * 1. DATA EFFICIENCY (35%) - PRIMAIRE FACTOR
     * Page size is de belangrijkste voorspeller van CO2 impact (SWDM v4 basis)
     */
    calculateDataEfficiency(data) {
        const sizeKB = data.transferSize || 2048; // fallback to average
        
        // Industry-based scoring: 0.36g avg, <0.5g good, <0.3g excellent (SWDM v4)
        // Translated to page size: 500KB excellent, 1MB good, 2MB average, 4MB+ poor
        let score;
        if (sizeKB <= 500) {
            score = 95 + (500 - sizeKB) / 100; // 95-100 range
        } else if (sizeKB <= 1024) {
            score = 80 - ((sizeKB - 500) / 524) * 15; // 80-95
        } else if (sizeKB <= 2048) {
            score = 60 - ((sizeKB - 1024) / 1024) * 20; // 60-80
        } else if (sizeKB <= 4096) {
            score = 30 - ((sizeKB - 2048) / 2048) * 20; // 30-60
        } else {
            score = Math.max(5, 30 - (sizeKB - 4096) / 1000); // 5-30
        }
        
        return {
            score: Math.max(0, Math.round(score)),
            value: sizeKB,
            status: this.getFactorStatus(score),
            impact: `${sizeKB}KB data transfer per visit`,
            improvement: sizeKB > 1024 ? "Comprimeer afbeeldingen en minify CSS/JS" : null
        };
    },

    /**
     * 2. RESOURCE COUNT (20%) - HTTP requests & DOM complexity  
     */
    calculateResourceCount(data) {
        const requests = data.httpRequests || 70; // fallback to average
        const domElements = data.domElements || 1500; // fallback to average
        
        // HTTP Requests scoring (0-100)
        let requestScore;
        if (requests <= 25) {
            requestScore = 100;
        } else if (requests <= 50) {
            requestScore = 80 - ((requests - 25) / 25) * 30; // 80-50
        } else if (requests <= 100) {
            requestScore = 50 - ((requests - 50) / 50) * 40; // 50-10
        } else {
            requestScore = 10;
        }
        
        // DOM Elements scoring (0-100)
        let domScore;
        if (domElements <= 800) {
            domScore = 100;
        } else if (domElements <= 1500) {
            domScore = 80 - ((domElements - 800) / 700) * 30; // 80-50
        } else if (domElements <= 3000) {
            domScore = 50 - ((domElements - 1500) / 1500) * 40; // 50-10
        } else {
            domScore = 10;
        }
        
        // Combined score (weighted average)
        const combinedScore = (requestScore * 0.6) + (domScore * 0.4);
        
        return {
            score: Math.round(combinedScore),
            value: { requests, domElements },
            status: this.getFactorStatus(combinedScore),
            impact: `${requests} HTTP requests, ${domElements} DOM elements`,
            improvement: requests > 50 ? "Combineer bestanden en reduceer requests" : null
        };
    },

    /**
     * 3. MEDIA OPTIMIZATION (12%) - Image efficiency
     */
    calculateMediaOptimization(data) {
        const imageScore = (data.optimizations?.imageOptimizationScore || 0.7) * 100;
        
        // Direct conversion from 0-1 to 0-100 scale
        const score = Math.round(imageScore);
        
        return {
            score: score,
            value: imageScore,
            status: this.getFactorStatus(score),
            impact: `${Math.round(imageScore)}% afbeeldingen geoptimaliseerd`,
            improvement: imageScore < 80 ? "Converteer naar WebP/AVIF en comprimeer afbeeldingen" : null
        };
    },

    /**
     * 4. CODE EFFICIENCY (8%) - Unused CSS/JS waste
     */
    calculateCodeEfficiency(data) {
        const unusedCSS = data.optimizations?.unusedCSS || 0;
        const unusedJS = data.optimizations?.unusedJS || 0;
        const totalUnused = unusedCSS + unusedJS;
        const totalSize = data.transferSize || 2048;
        
        // Calculate waste percentage
        const wastePercentage = (totalUnused / totalSize) * 100;
        
        // Score based on waste percentage (inverted - less waste = higher score)
        let score;
        if (wastePercentage <= 5) {
            score = 100;
        } else if (wastePercentage <= 15) {
            score = 90 - ((wastePercentage - 5) / 10) * 40; // 90-50
        } else if (wastePercentage <= 30) {
            score = 50 - ((wastePercentage - 15) / 15) * 30; // 50-20
        } else {
            score = 20 - Math.min((wastePercentage - 30) / 20 * 20, 20); // 20-0
        }
        
        return {
            score: Math.max(0, Math.round(score)),
            value: { unusedCSS, unusedJS, totalUnused },
            status: this.getFactorStatus(score),
            impact: `${totalUnused}KB ongebruikte code (${Math.round(wastePercentage)}%)`,
            improvement: totalUnused > 20 ? "Verwijder ongebruikte CSS en JavaScript" : null
        };
    },

    /**
     * 5. LOADING EFFICIENCY (7%) - Performance impact
     */
    calculateLoadingEfficiency(data) {
        const performanceScore = data.performanceScore || 65;
        
        // Direct mapping from performance score
        // Better performance = less reloads = less energy waste
        const score = Math.round(performanceScore);
        
        return {
            score: score,
            value: performanceScore,
            status: this.getFactorStatus(score),
            impact: `${performanceScore}/100 loading performance`,
            improvement: performanceScore < 70 ? "Optimaliseer Core Web Vitals voor minder herlaads" : null
        };
    },

    /**
     * 6. USER EXPERIENCE (3%) - CLS, FID impact
     */
    calculateUserExperience(data) {
        // For now, use performance score as proxy
        // Later can be expanded with specific CLS/FID metrics
        const performanceScore = data.performanceScore || 65;
        
        // UX score based on performance (frustration → more energy waste)
        const score = Math.round(performanceScore * 0.9); // Slightly lower than pure performance
        
        return {
            score: score,
            value: performanceScore,
            status: this.getFactorStatus(score),
            impact: "User experience quality",
            improvement: performanceScore < 70 ? "Verbeter layout stabiliteit" : null
        };
    },

    /**
     * 7. GREEN HOSTING (15%) - BEWEZEN 14% EMISSIEREDUCTIE
     * Verhoogd van 10% naar 15% gebaseerd op Mightybytes onderzoek
     */
    calculateGreenHosting(data) {
        const isGreen = data.greenHosting?.isGreen || false;
        
        // Evidence-based scoring: 14% emissiereductie voor groene hosting (Mightybytes)
        // 100 voor groen, 25 voor grijs (niet 0 om andere factoren niet te domineren)
        const score = isGreen ? 100 : 25;
        
        return {
            score: score,
            value: isGreen,
            status: isGreen ? 'excellent' : 'poor',
            impact: isGreen ? "Groene hosting gebruikt" : "Grijze hosting gebruikt",
            improvement: !isGreen ? "Schakel over naar groene hosting provider" : null
        };
    },

    /**
     * Convert score to status level
     */
    getFactorStatus(score) {
        if (score >= 85) return 'excellent';
        if (score >= 70) return 'good';  
        if (score >= 50) return 'average';
        return 'poor';
    },

    /**
     * Convert score to grade
     */
    getGrade(score) {
        if (score >= 90) return 'A+';
        if (score >= 80) return 'A';
        if (score >= 70) return 'B';
        if (score >= 60) return 'C';
        if (score >= 40) return 'D';
        return 'F';
    },

    /**
     * Generate actionable insights
     */
    generateInsights(factors, finalScore) {
        const improvements = [];
        const strengths = [];
        
        // Collect improvements and strengths
        Object.entries(factors).forEach(([key, factor]) => {
            if (factor.improvement) {
                improvements.push({
                    area: key,
                    suggestion: factor.improvement,
                    impact: factor.score < 50 ? 'high' : 'medium'
                });
            }
            
            if (factor.score >= 85) {
                strengths.push({
                    area: key,
                    description: factor.impact
                });
            }
        });
        
        // Overall assessment
        let assessment;
        if (finalScore >= 85) {
            assessment = "SUPER! Deze website heeft een zeer lage milieu-impact.";
        } else if (finalScore >= 70) {
            assessment = "Cava, maar er is zeker ruimte voor verbetering.";
        } else if (finalScore >= 50) {
            assessment = "Dit is aan de zwakke kant, er zijn meerdere kansen voor optimalisatie.";
        } else {
            assessment = "Hoge milieu-impact - prioriteit voor optimalisatie!";
        }
        
        return {
            assessment,
            improvements: improvements.sort((a, b) => b.impact === 'high' ? 1 : -1),
            strengths,
            topPriority: improvements.length > 0 ? improvements[0] : null
        };
    }
};

// Export voor gebruik in andere files
if (typeof window !== 'undefined') {
    window.SustainabilityScorer = SustainabilityScorer;
}

// Test functie (alleen in development)
function testSustainabilityScore() {
    const testData = {
        transferSize: 1500,        // KB  
        httpRequests: 45,
        domElements: 1200,
        optimizations: {
            imageOptimizationScore: 0.85,
            unusedCSS: 25,            // KB
            unusedJS: 40             // KB
        },
        performanceScore: 78,
        greenHosting: { isGreen: true },
        co2PerVisit: 2.5          // grams
    };
    
    const result = SustainabilityScorer.calculateSustainabilityScore(testData);
    console.log('🌱 Sustainability Score Test:', result);
    
    return result;
}

// Auto-test in development
if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
    // Test na 1 seconde
    setTimeout(() => {
        console.log('🧪 Testing Sustainability Scorer...');
        testSustainabilityScore();
    }, 1000);
}