require('dotenv').config();
const express = require('express');
const nodemailer = require('nodemailer');
const path = require('path');

const app = express();
const port = Number(process.env.PORT || 5500);

app.use(express.json({ limit: '100kb' }));
app.use(express.urlencoded({ extended: true }));
app.use(express.static(__dirname));

const recentRequests = new Map();
const RATE_LIMIT_WINDOW_MS = 60 * 1000;
const RATE_LIMIT_MAX = 5;

const smtpHost = process.env.BREVO_SMTP_HOST || 'smtp-relay.brevo.com';
const smtpPort = Number(process.env.BREVO_SMTP_PORT || 587);
const smtpLogin = process.env.BREVO_SMTP_LOGIN;
const smtpKey = process.env.BREVO_SMTP_KEY;
const fromEmail = process.env.CONTACT_FROM_EMAIL;
const toEmail = process.env.CONTACT_TO_EMAIL;

if (!smtpLogin || !smtpKey || !fromEmail || !toEmail) {
    console.warn('Missing config. Set BREVO_SMTP_LOGIN, BREVO_SMTP_KEY, CONTACT_FROM_EMAIL, CONTACT_TO_EMAIL in .env');
}

function rateLimit(req, res, next) {
    const key = req.ip || 'unknown';
    const now = Date.now();
    const timestamps = (recentRequests.get(key) || []).filter((t) => now - t < RATE_LIMIT_WINDOW_MS);

    if (timestamps.length >= RATE_LIMIT_MAX) {
        return res.status(429).json({ message: 'Too many requests. Please try again in a minute.' });
    }

    timestamps.push(now);
    recentRequests.set(key, timestamps);
    next();
}

function validateEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function getTransporter() {
    return nodemailer.createTransport({
        host: smtpHost,
        port: smtpPort,
        secure: smtpPort === 465,
        auth: {
            user: smtpLogin,
            pass: smtpKey
        }
    });
}

app.post('/api/contact', rateLimit, async (req, res) => {
    const { name, email, message } = req.body || {};

    const cleanName = String(name || '').trim();
    const cleanEmail = String(email || '').trim();
    const cleanMessage = String(message || '').trim();

    if (!cleanName || !cleanEmail || !cleanMessage) {
        return res.status(400).json({ message: 'Name, email, and message are required.' });
    }

    if (cleanName.length > 80 || cleanEmail.length > 120 || cleanMessage.length > 2000) {
        return res.status(400).json({ message: 'Input is too long.' });
    }

    if (!validateEmail(cleanEmail)) {
        return res.status(400).json({ message: 'Please provide a valid email address.' });
    }

    if (!smtpLogin || !smtpKey || !fromEmail || !toEmail) {
        return res.status(500).json({ message: 'Server email config is missing.' });
    }

    try {
        const transporter = getTransporter();

        await transporter.sendMail({
            from: fromEmail,
            to: toEmail,
            replyTo: cleanEmail,
            subject: `Portfolio Contact - ${cleanName}`,
            text: `Name: ${cleanName}\nEmail: ${cleanEmail}\n\nMessage:\n${cleanMessage}`,
            html: `<p><strong>Name:</strong> ${escapeHtml(cleanName)}</p>
                   <p><strong>Email:</strong> ${escapeHtml(cleanEmail)}</p>
                   <p><strong>Message:</strong></p>
                   <p>${escapeHtml(cleanMessage).replace(/\n/g, '<br>')}</p>`
        });

        return res.status(200).json({ message: 'Message sent successfully.' });
    } catch (error) {
        console.error('Contact mail error:', error.message);
        return res.status(500).json({ message: 'Failed to send message. Please try again later.' });
    }
});

app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

function escapeHtml(value) {
    return value
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

app.listen(port, () => {
    console.log(`Portfolio running on http://localhost:${port}`);
});