export default {
    async fetch(request, env) {
        const origin = env.CLIENT_ORIGIN || '*';
        const url = new URL(request.url);

        if (request.method === 'OPTIONS') {
            return new Response(null, { status: 204, headers: corsHeaders(origin) });
        }

        if (url.pathname !== '/api/contact') {
            return new Response('Not Found', { status: 404, headers: corsHeaders(origin) });
        }

        if (request.method !== 'POST') {
            return json({ message: 'Method not allowed.' }, 405, origin);
        }

        try {
            const body = await request.json();
            const payload = {
                name: String(body?.name || '').trim(),
                email: String(body?.email || '').trim(),
                message: String(body?.message || '').trim()
            };

            if (!payload.name || !payload.email || !payload.message) {
                return json({ message: 'Name, email, and message are required.' }, 400, origin);
            }

            if (!isValidEmail(payload.email)) {
                return json({ message: 'Please provide a valid email address.' }, 400, origin);
            }

            if (!env.BREVO_API_KEY) {
                return json({ message: 'Server email configuration missing.' }, 500, origin);
            }

            const toEmail = env.TO_EMAIL || 'vkvikas74@gmail.com';
            const fromEmail = env.FROM_EMAIL || 'vkvikas74@gmail.com';

            const brevoResponse = await fetch('https://api.brevo.com/v3/smtp/email', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'api-key': env.BREVO_API_KEY
                },
                body: JSON.stringify({
                    sender: { email: fromEmail, name: 'Portfolio Contact' },
                    to: [{ email: toEmail }],
                    replyTo: { email: payload.email, name: payload.name },
                    subject: `Portfolio Contact - ${payload.name}`,
                    textContent: `Name: ${payload.name}\nEmail: ${payload.email}\n\nMessage:\n${payload.message}`
                })
            });

            if (!brevoResponse.ok) {
                const errorText = await brevoResponse.text();
                return json({ message: `Brevo request failed: ${errorText}` }, 502, origin);
            }

            return json({ message: 'Message sent successfully.' }, 200, origin);
        } catch (error) {
            return json({ message: `Unexpected error: ${error.message}` }, 500, origin);
        }
    }
};

function corsHeaders(origin) {
    return {
        'Access-Control-Allow-Origin': origin,
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type'
    };
}

function json(data, status, origin) {
    return new Response(JSON.stringify(data), {
        status,
        headers: {
            ...corsHeaders(origin),
            'Content-Type': 'application/json'
        }
    });
}

function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}