// SUPER SIMPELE TEST VERSIE - geen externe API's
const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

console.log('🚀 Server starting...');
console.log('📍 PORT:', PORT);
console.log('🌍 NODE_ENV:', process.env.NODE_ENV);
console.log('🔑 API KEY aanwezig:', !!process.env.GOOGLE_API_KEY);

// Simpele test route
app.get('/', (req, res) => {
    res.send(`
        <h1>🎉 SUCCESS! Server draait!</h1>
        <p>Poort: ${PORT}</p>
        <p>Environment: ${process.env.NODE_ENV || 'development'}</p>
        <p>API Key: ${process.env.GOOGLE_API_KEY ? 'Aanwezig ✅' : 'Ontbreekt ❌'}</p>
        <p>Tijd: ${new Date().toLocaleString()}</p>
    `);
});

// Simpel health check endpoint
app.get('/health', (req, res) => {
    res.json({ 
        status: 'OK',
        port: PORT,
        time: new Date().toISOString()
    });
});

app.listen(PORT, () => {
    console.log(`✅ Server succesvol gestart op poort ${PORT}`);
    console.log(`📱 Test URL: http://localhost:${PORT}`);
});

// Error handling
process.on('uncaughtException', (err) => {
    console.error('💥 Uncaught Exception:', err);
    process.exit(1);
});

process.on('unhandledRejection', (err) => {
    console.error('💥 Unhandled Rejection:', err);
    process.exit(1);
});