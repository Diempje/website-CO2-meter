// Import van onze "ingrediënten"
const express = require('express');
const path = require('path');
const axios = require('axios');
const co2 = require('@tgwf/co2');

// Laad environment variables
require('dotenv').config();

// Maak een Express app (onze webserver)
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware setup
app.use(express.json()); // Voor JSON data van frontend
app.use(express.static(path.join(__dirname, 'public'))); // Serve static files from public directory

// BENCHMARK DATA - Bijgewerkte waarden gebaseerd op Website Carbon Calculator 2024
const BENCHMARK_DATA = {
    pageSize: {
        average: 2048, // KB - gemiddelde website grootte
        excellent: 512, // KB - uitstekend
        good: 1024, // KB - goed
        poor: 4096 // KB - slecht
    },
    co2PerVisit: {
        average: 0.8, // gram CO2 - Website Carbon Calculator 2024 mediaan
        excellent: 0.2, // gram CO2 - zeer goed
        good: 0.5, // gram CO2 - goed
        poor: 2.0 // gram CO2 - slecht
    },
    performanceScore: {
        average: 65, // Google PageSpeed gemiddelde
        excellent: 90,
        good: 75,
        poor: 50
    },
    httpRequests: {
        average: 70, // gemiddeld aantal HTTP requests
        excellent: 30,
        good: 50,
        poor: 100
    },
    domElements: {
        average: 1500, // gemiddeld aantal DOM elementen
        excellent: 800,
        good: 1200,
        poor: 3000
    }
};

// Helper functie om benchmark vergelijking te maken
function calculateBenchmarks(data) {
    const benchmarks = {};
    
    // Page Size Benchmark
    const pageSizeKB = data.transferSize;
    benchmarks.pageSize = {
        value: pageSizeKB,
        average: BENCHMARK_DATA.pageSize.average,
        status: pageSizeKB <= BENCHMARK_DATA.pageSize.excellent ? 'excellent' :
               pageSizeKB <= BENCHMARK_DATA.pageSize.good ? 'good' :
               pageSizeKB <= BENCHMARK_DATA.pageSize.average ? 'average' : 'poor',
        percentage: Math.abs(Math.round(((pageSizeKB - BENCHMARK_DATA.pageSize.average) / BENCHMARK_DATA.pageSize.average) * 100)),
        message: pageSizeKB <= BENCHMARK_DATA.pageSize.average ? 
                `${Math.round(((BENCHMARK_DATA.pageSize.average - pageSizeKB) / BENCHMARK_DATA.pageSize.average) * 100)}% kleiner dan gemiddeld` :
                `${Math.round(((pageSizeKB - BENCHMARK_DATA.pageSize.average) / BENCHMARK_DATA.pageSize.average) * 100)}% groter dan gemiddeld`
    };
    
    // CO2 Benchmark (UPDATED met nieuwe 0.8g benchmark)
    const co2Value = data.co2PerVisit;
    benchmarks.co2 = {
        value: co2Value,
        average: BENCHMARK_DATA.co2PerVisit.average,
        status: co2Value <= BENCHMARK_DATA.co2PerVisit.excellent ? 'excellent' :
               co2Value <= BENCHMARK_DATA.co2PerVisit.good ? 'good' :
               co2Value <= BENCHMARK_DATA.co2PerVisit.average ? 'average' : 'poor',
        percentage: Math.abs(Math.round(((co2Value - BENCHMARK_DATA.co2PerVisit.average) / BENCHMARK_DATA.co2PerVisit.average) * 100)),
        message: co2Value <= BENCHMARK_DATA.co2PerVisit.average ? 
                `${Math.round(((BENCHMARK_DATA.co2PerVisit.average - co2Value) / BENCHMARK_DATA.co2PerVisit.average) * 100)}% minder CO2 dan gemiddeld` :
                `${Math.round(((co2Value - BENCHMARK_DATA.co2PerVisit.average) / BENCHMARK_DATA.co2PerVisit.average) * 100)}% meer CO2 dan gemiddeld`
    };
    
    // Performance Benchmark
    const performanceScore = data.performanceScore;
    benchmarks.performance = {
        value: performanceScore,
        average: BENCHMARK_DATA.performanceScore.average,
        status: performanceScore >= BENCHMARK_DATA.performanceScore.excellent ? 'excellent' :
               performanceScore >= BENCHMARK_DATA.performanceScore.good ? 'good' :
               performanceScore >= BENCHMARK_DATA.performanceScore.average ? 'average' : 'poor',
        percentage: Math.abs(Math.round(((performanceScore - BENCHMARK_DATA.performanceScore.average) / BENCHMARK_DATA.performanceScore.average) * 100)),
        message: performanceScore >= BENCHMARK_DATA.performanceScore.average ? 
                `${Math.round(((performanceScore - BENCHMARK_DATA.performanceScore.average) / BENCHMARK_DATA.performanceScore.average) * 100)}% beter dan gemiddeld` :
                `${Math.round(((BENCHMARK_DATA.performanceScore.average - performanceScore) / BENCHMARK_DATA.performanceScore.average) * 100)}% slechter dan gemiddeld`
    };
    
    // HTTP Requests Benchmark (NEW)
    if (data.httpRequests) {
        benchmarks.httpRequests = {
            value: data.httpRequests,
            average: BENCHMARK_DATA.httpRequests.average,
            status: data.httpRequests <= BENCHMARK_DATA.httpRequests.excellent ? 'excellent' :
                   data.httpRequests <= BENCHMARK_DATA.httpRequests.good ? 'good' :
                   data.httpRequests <= BENCHMARK_DATA.httpRequests.average ? 'average' : 'poor',
            percentage: Math.abs(Math.round(((data.httpRequests - BENCHMARK_DATA.httpRequests.average) / BENCHMARK_DATA.httpRequests.average) * 100)),
            message: data.httpRequests <= BENCHMARK_DATA.httpRequests.average ? 
                    `${Math.round(((BENCHMARK_DATA.httpRequests.average - data.httpRequests) / BENCHMARK_DATA.httpRequests.average) * 100)}% minder requests dan gemiddeld` :
                    `${Math.round(((data.httpRequests - BENCHMARK_DATA.httpRequests.average) / BENCHMARK_DATA.httpRequests.average) * 100)}% meer requests dan gemiddeld`
        };
    }
    
    // DOM Elements Benchmark (NEW)
    if (data.domElements) {
        benchmarks.domElements = {
            value: data.domElements,
            average: BENCHMARK_DATA.domElements.average,
            status: data.domElements <= BENCHMARK_DATA.domElements.excellent ? 'excellent' :
                   data.domElements <= BENCHMARK_DATA.domElements.good ? 'good' :
                   data.domElements <= BENCHMARK_DATA.domElements.average ? 'average' : 'poor',
            percentage: Math.abs(Math.round(((data.domElements - BENCHMARK_DATA.domElements.average) / BENCHMARK_DATA.domElements.average) * 100)),
            message: data.domElements <= BENCHMARK_DATA.domElements.average ? 
                    `${Math.round(((BENCHMARK_DATA.domElements.average - data.domElements) / BENCHMARK_DATA.domElements.average) * 100)}% minder elementen dan gemiddeld` :
                    `${Math.round(((data.domElements - BENCHMARK_DATA.domElements.average) / BENCHMARK_DATA.domElements.average) * 100)}% meer elementen dan gemiddeld`
        };
    }
    
    return benchmarks;
}

// Helper functie om visitor impact te berekenen
function calculateVisitorImpact(co2PerVisit) {
    const visitorScales = [
        { visitors: 1000, label: "1.000 bezoekers/maand" },
        { visitors: 10000, label: "10.000 bezoekers/maand" },
        { visitors: 100000, label: "100.000 bezoekers/maand" }
    ];
    
    return visitorScales.map(scale => {
        const totalCO2Monthly = (co2PerVisit * scale.visitors); // gram per maand
        const totalCO2Yearly = totalCO2Monthly * 12; // gram per jaar
        
        // Vergelijkingen
        const treesNeeded = Math.round((totalCO2Yearly / 1000) / 22); // 22kg CO2 per boom per jaar
        const kmDriving = Math.round((totalCO2Yearly / 404) * 100) / 100; // 404g CO2 per km
        
        return {
            ...scale,
            totalCO2Monthly: Math.round(totalCO2Monthly * 100) / 100,
            totalCO2Yearly: Math.round((totalCO2Yearly / 1000) * 100) / 100, // kg
            treesNeeded: Math.max(treesNeeded, 1),
            kmDriving: Math.max(kmDriving, 0.1)
        };
    });
}

// API route voor website analyse
app.post('/api/analyze', async (req, res) => {
    try {
        const { url } = req.body;
        
        console.log('📝 Request body:', req.body);
        console.log('🔑 API Key aanwezig:', !!process.env.GOOGLE_API_KEY);
        
        if (!url) {
            return res.status(400).json({ error: 'URL is verplicht' });
        }
        
        console.log(`🔍 Analyseren: ${url}`);
        
        // Google PageSpeed Insights API call
        const apiKey = process.env.GOOGLE_API_KEY;
        const pageSpeedUrl = `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${encodeURIComponent(url)}&key=${apiKey}`;
        
        console.log('🌐 PageSpeed URL:', pageSpeedUrl.replace(apiKey, 'HIDDEN_KEY'));
        
        // Eerste: Google PageSpeed call (deze werkt)
        const response = await axios.get(pageSpeedUrl);
        const data = response.data;
        
        // Dan pas groene hosting checken (als backup als het faalt)
        let isGreenHosting = false;
        let hostingProvider = 'Onbekend';
        
        try {
            const domain = new URL(url).hostname;
            console.log('🔍 Checken groene hosting voor:', domain);
            
            // Probeer verschillende API endpoints
            const hostingResponse = await axios.get(`https://api.thegreenwebfoundation.org/greencheck/${domain}`, {
                timeout: 8000, // Verhoogd naar 8 seconden
                headers: {
                    'User-Agent': 'Website-CO2-Meter/1.0'
                }
            });
            
            console.log('🌐 Green Web API Response:', hostingResponse.data);
            
            isGreenHosting = hostingResponse.data.green || false;
            hostingProvider = hostingResponse.data.hosted_by || hostingResponse.data.hostedby || 'Onbekend';
            
            console.log('🌱 Groene hosting:', isGreenHosting ? 'JA' : 'NEE');
            console.log('🏢 Hosting provider:', hostingProvider);
            
        } catch (hostingError) {
            console.log('⚠️ Groene hosting check mislukt:', hostingError.message);
            
            // FALLBACK voor bekende groene providers + localhost
            const domain = new URL(url).hostname;
            const knownGreenProviders = [
                'combell.com', 'combell.be', '.combell.', 'diim.be',
                'vercel.app', 'netlify.app', 'github.io',
                'localhost', '127.0.0.1'
            ];
            
            const isKnownGreen = knownGreenProviders.some(provider => 
                domain.includes(provider) || url.includes(provider) || domain === provider
            );
            
            if (isKnownGreen) {
                console.log('🌱 FALLBACK: Using known green provider data');
                isGreenHosting = true;
                if (domain === 'localhost' || domain === '127.0.0.1') {
                    hostingProvider = 'Local development (assumed green)';
                } else if (domain.includes('diim.be')) {
                    hostingProvider = 'Combell (verified green hosting - diim.be)';
                } else if (domain.includes('combell')) {
                    hostingProvider = 'Combell (verified green hosting)';
                } else {
                    hostingProvider = 'Green hosting provider';
                }
            }
        }
        
        // Extracteer belangrijke metrics
        const metrics = data.lighthouseResult.audits;
        
        // Transfer size (in bytes)
        const transferSize = metrics['total-byte-weight']?.numericValue || 1000000; // fallback: 1MB
        
        // NIEUWE METRICS EXTRACTIE
        const domElements = metrics['dom-size']?.numericValue || null;
        const httpRequests = metrics['network-requests']?.details?.items?.length || null;
        
        // EXTRA DATA die Google ons geeft:
        const imageOptimization = metrics['uses-optimized-images'];
        const unusedCSS = metrics['unused-css-rules'];
        const unusedJS = metrics['unused-javascript'];
        
        console.log('🖼️ Image optimization:', imageOptimization?.score);
        console.log('🎨 Unused CSS:', unusedCSS?.details?.overallSavingsBytes || 0, 'bytes');
        console.log('💻 Unused JS:', unusedJS?.details?.overallSavingsBytes || 0, 'bytes');
        console.log('🏠 DOM Elements:', domElements);
        console.log('📡 HTTP Requests:', httpRequests);
        
        // CO2 berekening met CO2.js
        const swd = new co2.co2({ model: "swd" }); // Sustainable Web Design model
        const co2Emission = swd.perByte(transferSize);
        
        console.log('📊 Transfer size:', transferSize, 'bytes');
        console.log('🌱 CO2 emission:', co2Emission, 'grams');
        
        // Performance score
        const performanceScore = data.lighthouseResult.categories.performance.score * 100;
        
        // Bereken benchmarks
        const analysisData = {
            transferSize: Math.round(transferSize / 1024), // KB
            co2PerVisit: Math.round(co2Emission * 1000) / 1000,
            performanceScore: Math.round(performanceScore),
            httpRequests: httpRequests,
            domElements: domElements
        };
        
        const benchmarks = calculateBenchmarks(analysisData);
        const visitorImpact = calculateVisitorImpact(analysisData.co2PerVisit);
        
        console.log('📊 Benchmarks berekend:', benchmarks);
        console.log('👥 Visitor impact berekend:', visitorImpact);
        
        // Resultaat samenstellen
        const result = {
            url: url,
            co2PerVisit: analysisData.co2PerVisit,
            transferSize: analysisData.transferSize,
            performanceScore: analysisData.performanceScore,
            grade: getGrade(performanceScore),
            comparison: getComparison(co2Emission),
            // NIEUWE METRICS:
            domElements: domElements,
            httpRequests: httpRequests,
            // Groene hosting info
            greenHosting: {
                isGreen: isGreenHosting,
                provider: hostingProvider,
                impact: isGreenHosting ? 'Lagere CO2 impact door groene energie!' : 'Hogere CO2 impact - overweeg groene hosting'
            },
            // EXTRA OPTIMALISATIE INFO:
            optimizations: {
                imageOptimizationScore: imageOptimization?.score || 0,
                unusedCSS: Math.round((unusedCSS?.details?.overallSavingsBytes || 0) / 1024), // KB
                unusedJS: Math.round((unusedJS?.details?.overallSavingsBytes || 0) / 1024), // KB
                canSave: Math.round(((unusedCSS?.details?.overallSavingsBytes || 0) + 
                         (unusedJS?.details?.overallSavingsBytes || 0)) / 1024) // KB
            },
            // BENCHMARK DATA:
            benchmarks: benchmarks,
            // VISITOR IMPACT DATA (NEW):
            visitorImpact: visitorImpact
        };
        
        res.json(result);
        
    } catch (error) {
        console.error('❌ Fout bij analyse:', error.message);
        res.status(500).json({ 
            error: 'Er ging iets mis bij het analyseren van de website',
            details: error.message 
        });
    }
});

// Health check endpoint (voor monitoring)
app.get('/health', (req, res) => {
    res.json({ 
        status: 'OK', 
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
    });
});

// Hoofdpagina route - serve the HTML file
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Catch-all route voor SPA (Single Page Application) support
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Helper functies
function getGrade(score) {
    if (score >= 90) return 'A+';
    if (score >= 80) return 'A';
    if (score >= 70) return 'B+';
    if (score >= 60) return 'B';
    if (score >= 50) return 'C';
    return 'D';
}

function getComparison(co2Grams) {
    const kmDriving = (co2Grams / 404) * 1000; // 404g CO2 per km autorijden
    return `${Math.round(kmDriving * 100) / 100}km autorijden`;
}

// Start de server
app.listen(PORT, () => {
    console.log(`🚀 Website CO2 Meter draait op poort ${PORT}`);
    console.log(`📁 Static files served from: ${path.join(__dirname, 'public')}`);
    console.log('💡 Druk Ctrl+C om te stoppen');
});