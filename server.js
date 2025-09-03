// Import van onze "ingrediënten"
const express = require('express');
const path = require('path');
const axios = require('axios');
const co2 = require('@tgwf/co2');

// Laad environment variables
require('dotenv').config();

// Maak een Express app (onze webserver)
const app = express();
const PORT = 3000;

// Vertel Express dat we HTML/CSS bestanden willen serveren
app.use(express.static('public'));
app.use(express.json()); // Voor JSON data van frontend

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
        const pageSpeedData = response.data;
        
        // Dan pas groene hosting checken (als backup als het faalt)
        let isGreenHosting = false;
        let hostingProvider = 'Onbekend';
        
        try {
            const domain = new URL(url).hostname;
            console.log('🔍 Checken groene hosting voor:', domain);
            
            // Probeer verschillende API endpoints
            const hostingResponse = await axios.get(`https://api.thegreenwebfoundation.org/greencheck/${domain}`, {
                timeout: 5000 // 5 seconden timeout
            });
            
            isGreenHosting = hostingResponse.data.green || false;
            hostingProvider = hostingResponse.data.hostedby || hostingResponse.data.hosting_provider || 'Onbekend';
            
            console.log('🌱 Groene hosting:', isGreenHosting ? 'JA' : 'NEE');
            console.log('🏢 Hosting provider:', hostingProvider);
            
        } catch (hostingError) {
            console.log('⚠️ Groene hosting check mislukt, maar dat is oké:', hostingError.message);
            // We gaan gewoon door zonder groene hosting info
        }
        const data = response.data;
        
        // Extracteer belangrijke metrics
        const metrics = pageSpeedData.lighthouseResult.audits;
        const loadingExperience = pageSpeedData.loadingExperience;
        
        // Transfer size (in bytes)
        const transferSize = metrics['total-byte-weight']?.numericValue || 1000000; // fallback: 1MB
        
        // EXTRA DATA die Google ons geeft:
        const imageOptimization = metrics['uses-optimized-images'];
        const unusedCSS = metrics['unused-css-rules'];
        const unusedJS = metrics['unused-javascript'];
        const imageSize = metrics['total-byte-weight']?.details?.items?.find(item => 
            item.label && item.label.includes('image')
        ) || { transferSize: 0 };
        
        console.log('🖼️ Image optimization:', imageOptimization?.score);
        console.log('🎨 Unused CSS:', unusedCSS?.details?.overallSavingsBytes || 0, 'bytes');
        console.log('💻 Unused JS:', unusedJS?.details?.overallSavingsBytes || 0, 'bytes');
        
        // CO2 berekening met CO2.js
        const swd = new co2.co2({ model: "swd" }); // Sustainable Web Design model
        const co2Emission = swd.perByte(transferSize);
        
        console.log('📊 Transfer size:', transferSize, 'bytes');
        console.log('🌱 CO2 emission:', co2Emission, 'grams');
        
        // Performance score
        const performanceScore = pageSpeedData.lighthouseResult.categories.performance.score * 100;
        
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

// Hoofdpagina route
app.get('/', (req, res) => {
    res.send(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>Website CO2 Meter</title>
            <style>
                body { 
                    font-family: Arial, sans-serif; 
                    max-width: 800px; 
                    margin: 0 auto; 
                    padding: 20px;
                    background: #f5f5f5;
                }
                .container {
                    background: white;
                    padding: 30px;
                    border-radius: 10px;
                    box-shadow: 0 2px 10px rgba(0,0,0,0.1);
                }
                h1 { color: #2c5530; }
                .input-group {
                    margin: 20px 0;
                }
                input[type="url"] {
                    width: 70%;
                    padding: 10px;
                    border: 1px solid #ddd;
                    border-radius: 5px;
                }
                button {
                    background: #4CAF50;
                    color: white;
                    padding: 10px 20px;
                    border: none;
                    border-radius: 5px;
                    cursor: pointer;
                }
                button:hover {
                    background: #45a049;
                }
            </style>
        </head>
        <body>
            <div class="container">
                <h1>🌱 Website CO2 Meter</h1>
                <p>Ontdek de koolstofuitstoot van elke website!</p>
                
                <div class="input-group">
                    <input type="url" placeholder="https://example.com" id="websiteUrl">
                    <button onclick="analyzeWebsite()">Analyseer Website</button>
                </div>
                
                <div id="results" style="margin-top: 20px;"></div>
            </div>
            
            <script>
                async function analyzeWebsite() {
                    const url = document.getElementById('websiteUrl').value;
                    const resultsDiv = document.getElementById('results');
                    
                    if (!url) {
                        resultsDiv.innerHTML = '<p style="color: red;">Voer eerst een URL in!</p>';
                        return;
                    }
                    
                    // Zorg voor juiste URL format
                    let formattedUrl = url;
                    if (!url.startsWith('http://') && !url.startsWith('https://')) {
                        formattedUrl = 'https://' + url;
                    }
                    
                    resultsDiv.innerHTML = '<p>🔄 Website wordt geanalyseerd... Dit kan 5-10 seconden duren.</p>';
                    
                    try {
                        // Echte API call naar onze backend
                        const response = await fetch('/api/analyze', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                            },
                            body: JSON.stringify({ url: formattedUrl })
                        });
                        
                        const data = await response.json();
                        
                        if (response.ok) {
                            // Succesvol - toon echte resultaten
                            resultsDiv.innerHTML = 
                                '<div style="border: 1px solid #4CAF50; padding: 15px; border-radius: 5px; background: #f9f9f9;">' +
                                    '<h3>🌱 Analyse Resultaten voor: ' + data.url + '</h3>' +
                                    
                                    // Groene hosting status
                                    '<div style="background: ' + (data.greenHosting.isGreen ? '#d4edda' : '#f8d7da') + '; padding: 10px; border-radius: 5px; margin: 10px 0; border: 1px solid ' + (data.greenHosting.isGreen ? '#c3e6cb' : '#f5c6cb') + ';">' +
                                        '<p style="margin: 0;"><strong>' + (data.greenHosting.isGreen ? '🌱 Groene Hosting!' : '⚡ Grijze Hosting') + '</strong></p>' +
                                        '<p style="margin: 5px 0 0 0; font-size: 0.9em;">Provider: ' + data.greenHosting.provider + '</p>' +
                                        '<p style="margin: 5px 0 0 0; font-size: 0.9em;">' + data.greenHosting.impact + '</p>' +
                                    '</div>' +
                                    
                                    '<div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin: 15px 0;">' +
                                        '<div>' +
                                            '<p>✅ <strong>CO2 per bezoek:</strong> ' + data.co2PerVisit + 'g CO2</p>' +
                                            '<p>📊 <strong>Performance:</strong> ' + data.performanceScore + '/100 (' + data.grade + ')</p>' +
                                            '<p>📁 <strong>Website grootte:</strong> ' + data.transferSize + ' KB</p>' +
                                        '</div>' +
                                        '<div>' +
                                            '<p>🖼️ <strong>Afbeelding optimalisatie:</strong> ' + Math.round(data.optimizations.imageOptimizationScore * 100) + '/100</p>' +
                                            '<p>🎨 <strong>Ongebruikte CSS:</strong> ' + data.optimizations.unusedCSS + ' KB</p>' +
                                            '<p>💻 <strong>Ongebruikte JS:</strong> ' + data.optimizations.unusedJS + ' KB</p>' +
                                        '</div>' +
                                    '</div>' +
                                    '<p>🌍 <strong>Vergelijkbaar met:</strong> ' + data.comparison + '</p>' +
                                    (data.optimizations.canSave > 0 ? 
                                        '<p style="background: #fff3cd; padding: 10px; border-radius: 5px; margin-top: 10px;">💡 <strong>Tip:</strong> Je kunt ' + data.optimizations.canSave + ' KB besparen door ongebruikte code te verwijderen!</p>' 
                                        : '') +
                                    '<p style="margin-top: 15px; font-size: 0.9em; color: #666;"><em>Powered by Google PageSpeed Insights, CO2.js & Green Web Foundation</em></p>' +
                                '</div>';
                        } else {
                            // Fout van server
                            resultsDiv.innerHTML = 
                                '<div style="border: 1px solid #f44336; padding: 15px; border-radius: 5px; background: #ffebee;">' +
                                    '<h3>❌ Er ging iets mis</h3>' +
                                    '<p>' + data.error + '</p>' +
                                    '<p style="font-size: 0.8em; color: #666;">Controleer of de URL correct is en probeer opnieuw.</p>' +
                                '</div>';
                        }
                    } catch (error) {
                        // Netwerk fout
                        resultsDiv.innerHTML = 
                            '<div style="border: 1px solid #f44336; padding: 15px; border-radius: 5px; background: #ffebee;">' +
                                '<h3>❌ Verbindingsfout</h3>' +
                                '<p>Kon geen verbinding maken met de server.</p>' +
                                '<p style="font-size: 0.8em;">Fout: ' + error.message + '</p>' +
                            '</div>';
                    }
                }
            </script>
        </body>
        </html>
    `);
});

// Start de server
app.listen(PORT, () => {
    console.log(`🚀 Website CO2 Meter draait op http://localhost:${PORT}`);
    console.log('💡 Druk Ctrl+C om te stoppen');
});