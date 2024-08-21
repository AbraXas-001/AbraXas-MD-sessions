const express = require('express');
const bodyParser = require('body-parser');
const sulla = require('sulla-hotfix');
const app = express();
const port = process.env.PORT || 3000;

app.use(bodyParser.json());

let pairingCode = '';
let sessionId = '';
let userNumber = '';

sulla.create().then(client => {
    client.on('qr', (qr) => {
        pairingCode = qr;
    });

    client.on('authenticated', (session) => {
        sessionId = `AbraXas${session}`;
        console.log('Successfully connected with session ID:', sessionId);
        if (userNumber) {
            client.sendText(userNumber, `Your pairing code: ${pairingCode}\nConnection successful!`)
                .then(() => {
                    console.log('Message sent successfully.');
                })
                .catch(err => {
                    console.error('Failed to send message:', err);
                });
        }
    });

    client.on('auth_failure', () => {
        console.error('Authentication failed.');
    });
});

app.post('/generate-pairing-code', (req, res) => {
    const { number } = req.body;
    if (!number || !/^\+\d{1,15}$/.test(number)) {
        return res.status(400).json({ error: 'Valid WhatsApp number is required (e.g., +1234567890)' });
    }

    userNumber = number;
    res.json({ pairingCode });
});

app.get('/current-session-id', (req, res) => {
    if (!sessionId) {
        return res.status(204).json({});
    }
    res.json({ sessionId });
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
