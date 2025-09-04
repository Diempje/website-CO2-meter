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
app.use(express.static('public')); // Serve static files from public directory

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
        
        // EXTRA DATA die Google ons geeft:
        const imageOptimization = metrics['uses-optimized-images'];
        const unusedCSS = metrics['unused-css-rules'];
        const unusedJS = metrics['unused-javascript'];
        
        console.log('🖼️ Image optimization:', imageOptimization?.score);
        console.log('🎨 Unused CSS:', unusedCSS?.details?.overallSavingsBytes || 0, 'bytes');
        console.log('💻 Unused JS:', unusedJS?.details?.overallSavingsBytes || 0, 'bytes');
        
        // CO2 berekening met CO2.js
        const swd = new co2.co2({ model: "swd" }); // Sustainable Web Design model
        const co2Emission = swd.perByte(transferSize);
        
        console.log('📊 Transfer size:', transferSize, 'bytes');
        console.log('🌱 CO2 emission:', co2Emission, 'grams');
        
        // Performance score
        const performanceScore = data.lighthouseResult.categories.performance.score * 100;
        
        // Resultaat samenstellen
        const result = {
            url: url,
            co2PerVisit: Math.round(co2Emission * 1000) / 1000, // afronden op 3 decimalen
            transferSize: Math.round(transferSize / 1024), // KB
            performanceScore: Math.round(performanceScore),
            grade: getGrade(performanceScore),
            comparison: getComparison(co2Emission),
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
            }
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