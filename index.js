// Import van onze "ingrediënten"
const express = require('express');
const path = require('path');
const axios = require('axios');
const co2 = require('@tgwf/co2');
const nodemailer = require('nodemailer');
const { Pool } = require('pg');

// Laad environment variables
require('dotenv').config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// Test database connectie
pool.connect((err, client, release) => {
    if (err) {
        console.log('❌ Database connectie fout:', err);
    } else {
        console.log('✅ Database connected');
        release();
    }
});







// Maak een Express app (onze webserver)
const app = express();
const PORT = process.env.PORT || 3000;

// Email transporter setup - MOET VÓÓR de .verify() call!
const emailTransporter = nodemailer.createTransport({
    host: 'smtp-auth.mailprotect.be',
    port: 587,
    secure: false,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    },
    tls: {
        rejectUnauthorized: false
    }
});

// Test email connection bij server start - MOET NA de transporter definitie!
emailTransporter.verify((error, success) => {
    if (error) {
        console.log('❌ Email configuratie fout:', error);
    } else {
        console.log('✅ Email server ready');
    }
});

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

// Helper functies - UPDATED GRADE SCALE
function getGrade(score) {
    if (score >= 90) return 'A+';
    if (score >= 80) return 'A';
    if (score >= 70) return 'B';
    if (score >= 60) return 'C';
    if (score >= 50) return 'D';
    if (score >= 40) return 'E';
    return 'F';
}

function getComparison(co2Grams) {
    const kmDriving = (co2Grams / 404) * 1000; // 404g CO2 per km autorijden
    return `${Math.round(kmDriving * 100) / 100}km autorijden`;
}

// ========================================
// API ROUTES
// ========================================

app.get('/api/stats', async (req, res) => {
    try {
        // Basis statistieken
        const totalsResult = await pool.query(`
            SELECT COUNT(*) as total, 
                   AVG(score) as avg_performance_score, 
                   AVG(sustainability_score) as avg_sustainability_score,
                   AVG(co2_per_visit) as avg_co2 
            FROM analytics
        `);
        const totals = totalsResult.rows[0];
        
        // Grade verdeling
        const gradesResult = await pool.query(`
            SELECT grade, COUNT(*) as count 
            FROM analytics 
            GROUP BY grade 
            ORDER BY count DESC
        `);
        
        // Hosting types
        const hostingResult = await pool.query(`
            SELECT green_hosting, COUNT(*) as count 
            FROM analytics 
            GROUP BY green_hosting
        `);
        
      
        const domainsResult = await pool.query(`
            SELECT domain, COUNT(*) as count 
            FROM analytics 
            GROUP BY domain 
            ORDER BY count DESC 
            LIMIT 10
        `);
        
        res.json({
            totalAnalyses: parseInt(totals.total),
            averagePerformanceScore: Math.round(totals.avg_performance_score || 0),
            averageSustainabilityScore: Math.round(totals.avg_sustainability_score || 0),
            averageCO2: Math.round((totals.avg_co2 || 0) * 100) / 100,
            gradeDistribution: gradesResult.rows,
            hostingTypes: hostingResult.rows,
            topDomains: domainsResult.rows  // EN DIT MOET ER STAAN
        });
        
    } catch (error) {
        console.error('Stats error:', error);
        res.status(500).json({ error: 'Database error' });
    }
});


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
        let hostingProvider = '';
        
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
            hostingProvider = hostingResponse.data.hosted_by || hostingResponse.data.hostedby || '';
            
            console.log('🌱 Groene hosting:', isGreenHosting ? 'JA' : 'NEE');
            console.log('🏢 Hosting provider:', hostingProvider);
            
        } catch (hostingError) {
            console.log('⚠️ Groene hosting check mislukt:', hostingError.message);
            
            // FALLBACK voor bekende groene providers + localhost
            const domain = new URL(url).hostname;
            const knownGreenProviders = [
                'combell.com', 'combell.be', '.combell.', 'diim.be',
                'vercel.app', 'netlify.app', 'github.io',
                'localhost', '127.0.0.1', 'webecoscan.be'
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
            else {
                hostingProvider = ''; 
                isGreenHosting = false; 
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
        // Analytics opslaan
           res.json(result);

// Analytics opslaan (PostgreSQL versie)
// Analytics opslaan (PostgreSQL versie)
const insertAnalytics = async () => {
    try {
        const domain = new URL(result.url).hostname;
        const userAgent = req.headers['user-agent'] || 'Unknown';
        
        // VERWIJDER DEZE REGEL:
        // const sustainabilityResult = SustainabilityScorer.calculateSustainabilityScore(result);
        
        await pool.query(`
            INSERT INTO analytics 
            (url, domain, score, grade, co2_per_visit, transfer_size, green_hosting, http_requests, dom_elements, user_agent) 
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
            [result.url, domain, result.performanceScore, result.grade, result.co2PerVisit, 
             result.transferSize, result.greenHosting.isGreen, result.httpRequests, 
             result.domElements, userAgent]
        );
        console.log('Analytics saved:', domain);
    } catch (error) {
        console.log('Analytics error:', error);
    }
};

// Track sustainability score update
app.post('/api/track-sustainability', async (req, res) => {
    try {
        const { url, sustainability_score, sustainability_grade } = req.body;
        
        await pool.query(`
            UPDATE analytics 
            SET sustainability_score = $1, sustainability_grade = $2 
            WHERE url = $3 
            ORDER BY timestamp DESC 
            LIMIT 1`,
            [sustainability_score, sustainability_grade, url]
        );
        
        console.log('🌱 Sustainability score updated for:', url);
        res.json({ success: true });
        
    } catch (error) {
        console.log('❌ Sustainability track error:', error);
        res.json({ success: false, error: error.message });
    }
});


// Voer insert asynchroon uit
insertAnalytics();
        
    } catch (error) {
        console.error('❌ Fout bij analyse:', error.message);
        res.status(500).json({ 
            error: 'Er ging iets mis bij het analyseren van de website',
            details: error.message 
        });
    }
});

// Contact form endpoint
app.post('/api/contact', async (req, res) => {
    try {
        const { 
            name, 
            email, 
            company, 
            interest, 
            message, 
            website_url, 
            current_score,
            current_grade,
            co2_per_visit 
        } = req.body;
        
        console.log('Nieuw contactformulier van:', name, '(', email, ')');
        
        // Email naar jou
        const emailToYou = {
            from: process.env.EMAIL_USER,
            to: 'klopklop@diim.be', // Jouw email adres
            subject: `CO2 Meter Contact: ${interest} - ${name}`,
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #4CAF50;">Nieuwe CO2 Meter Contact</h2>
                    
                    <div style="background: #f9f9f9; padding: 20px; border-radius: 8px; margin: 20px 0;">
                        <h3>Contact Informatie</h3>
                        <p><strong>Naam:</strong> ${name}</p>
                        <p><strong>Email:</strong> <a href="mailto:${email}">${email}</a></p>
                        <p><strong>Bedrijf:</strong> ${company || 'Niet opgegeven'}</p>
                        <p><strong>Interesse:</strong> ${interest}</p>
                    </div>
                    
                    <div style="background: #e8f5e8; padding: 20px; border-radius: 8px; margin: 20px 0;">
                        <h3>Website Analyse Context</h3>
                        <p><strong>Website:</strong> <a href="${website_url}" target="_blank">${website_url}</a></p>
                        <p><strong>Duurzaamheidsscore:</strong> ${current_score}/100 (${current_grade})</p>
                        <p><strong>CO2 per bezoek:</strong> ${co2_per_visit}g</p>
                    </div>
                    
                    ${message ? `
                    <div style="background: #fff3cd; padding: 20px; border-radius: 8px; margin: 20px 0;">
                        <h3>Bericht van ${name}:</h3>
                        <p style="white-space: pre-wrap;">${message}</p>
                    </div>
                    ` : ''}
                    
                    <div style="background: #d4edda; padding: 15px; border-radius: 8px; margin: 20px 0;">
                        <p><strong>💡 Actie:</strong> Neem contact op binnen 24 uur via: <a href="mailto:${email}">${email}</a></p>
                    </div>
                    
                    <hr style="margin: 30px 0;">
                    <p style="color: #666; font-size: 12px;">
                        Dit bericht werd verzonden via de Website CO2 Meter tool op ${new Date().toLocaleString('nl-BE')}<br>
                        <a href="${website_url}">Bekijk de geanalyseerde website</a>
                    </p>
                </div>
            `
        };
        
        // Bevestigingsmail naar gebruiker
        const emailToUser = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: `Bedankt voor je interesse in duurzame websites!`,
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #4CAF50;">Hallo ${name}!</h2>
                    
                    <p>Bedankt voor je interesse in het verbeteren van de duurzaamheid van <strong>${website_url}</strong>!</p>
                    
                    <div style="background: #e8f5e8; padding: 20px; border-radius: 8px; margin: 20px 0;">
                        <h3>Je huidige resultaten:</h3>
                        <p><strong>Duurzaamheidsscore:</strong> ${current_score}/100 (${current_grade})</p>
                        <p><strong>CO2 per bezoek:</strong> ${co2_per_visit}g</p>
                        <p><strong>Je interesse:</strong> ${interest}</p>
                    </div>
                    
                    <p><strong>Wat gebeurt er nu?</strong></p>
                    <ul>
                        <li>Ik ga je website gedetailleerd bekijken</li>
                        <li>Ik bereid concrete verbeterpunten voor</li>
                        <li>Ik neem binnen 24 uur contact met je op</li>
                    </ul>
                    
                    <div style="background: #fff3cd; padding: 15px; border-radius: 8px; margin: 20px 0;">
                        <p><strong>Nog een tip:</strong> Heb je al naar je hosting provider gekeken? Groene hosting kan je CO2-impact met 60% verminderen!</p>
                    </div>
                    
                    <p>Met groene groeten,<br>
                    <strong>Dimitri Dehouck</strong><br>
                    Website Duurzaamheids Expert<br>
                    <a href="mailto:klopklop@diim.be">klopklop@diim.be</a></p>
                    
                    <hr style="margin: 30px 0;">
                    <p style="color: #666; font-size: 12px;">
                        Dit is een automatische bevestiging. Reageer gerust op deze email als je vragen hebt!
                    </p>
                </div>
            `
        };
        
        // Verstuur beide emails
        await emailTransporter.sendMail(emailToYou);
        await emailTransporter.sendMail(emailToUser);
        
        console.log('✅ Emails verzonden naar jou en', email);
        
        res.json({ 
            success: true, 
            message: 'Bericht verzonden! Je ontvangt een bevestiging per email.' 
        });
        
    } catch (error) {
        console.error('❌ Email verzend fout:', error);
        res.status(500).json({ 
            error: 'Er ging iets mis bij het versturen. Probeer opnieuw of neem direct contact op.' 
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



// Start de server
app.listen(PORT, () => {
    console.log(`🚀 Website CO2 Meter draait op poort ${PORT}`);
    console.log(`📁 Static files served from: ${path.join(__dirname, 'public')}`);
    console.log('💡 Druk Ctrl+C om te stoppen');
});

// Nieuwe route voor gedetailleerde analytics
app.get('/api/detailed-stats', async (req, res) => {

    const password = req.query.p;
    
    // Zelfde wachtwoord check
    if (password !== process.env.ANALYTICS_PASSWORD) {
        return res.status(401).json({ error: 'Unauthorized' });
    }
    try {
        const detailedResult = await pool.query(`
            SELECT DISTINCT ON (domain) 
                domain, 
                url,
                score as performance_score,
                co2_per_visit,
                transfer_size,
                green_hosting,
                timestamp
            FROM analytics 
            ORDER BY domain, timestamp DESC
        `);
        
        const statsResult = await pool.query(`
            SELECT 
                COUNT(*) as total_analyses,
                COUNT(DISTINCT domain) as unique_websites,
                AVG(co2_per_visit) as avg_co2,
                AVG(score) as avg_performance
            FROM analytics
        `);
        
        res.json({
            websites: detailedResult.rows,
            summary: statsResult.rows[0]
        });
        
    } catch (error) {
        console.error('Detailed stats error:', error);
        res.status(500).json({ error: 'Database error' });
    }
});


// Vervang je huidige /analytics route door:
app.get('/secret-dashboard-xyz123', (req, res) => {
    const password = req.query.p;

    // DEBUG - verwijder na testen
    console.log('Received password:', password);
    console.log('Expected password:', process.env.ANALYTICS_PASSWORD);
    console.log('Match:', password === process.env.ANALYTICS_PASSWORD);
    
    // Check wachtwoord
    if (password !== process.env.ANALYTICS_PASSWORD) {
        return res.status(401).send(`
            <html>
                <body style="font-family: Arial; text-align: center; margin-top: 100px;">
                    <h2>Wat doe je hier?</h2>
                    <p>Dit mocht je niet zien, keer terug van waar je gekomen bent</p>
                </body>
            </html>
        `);
    }
    
    res.sendFile(path.join(__dirname, 'public', 'analytics.html'));
});

// Hoofdpagina route - serve the HTML file
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Catch-all route voor SPA (Single Page Application) support
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});