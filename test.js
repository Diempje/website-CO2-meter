console.log('Testing nodemailer import...');
try {
    const nodemailer = require('nodemailer');
    console.log('Nodemailer object:', Object.keys(nodemailer));
    console.log('createTransporter type:', typeof nodemailer.createTransporter);
    
    if (nodemailer.createTransporter) {
        console.log('✅ createTransporter exists');
    } else {
        console.log('❌ createTransporter missing');
        console.log('Available methods:', Object.getOwnPropertyNames(nodemailer));
    }
} catch (error) {
    console.log('❌ Import error:', error.message);
}