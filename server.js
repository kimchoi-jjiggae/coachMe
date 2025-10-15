// Simple Node.js server to handle OpenAI API calls and avoid CORS issues
const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('.'));

// OpenAI API proxy endpoint
app.post('/api/chat', async (req, res) => {
    try {
        const { messages, apiKey } = req.body;
        
        if (!apiKey) {
            return res.status(400).json({ error: 'API key is required' });
        }

        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: 'gpt-3.5-turbo',
                messages: messages,
                max_tokens: 500,
                temperature: 0.7
            })
        });

        if (!response.ok) {
            const errorData = await response.text();
            return res.status(response.status).json({ 
                error: `OpenAI API error: ${response.status}`,
                details: errorData
            });
        }

        const data = await response.json();
        res.json(data);
        
    } catch (error) {
        console.error('Server error:', error);
        res.status(500).json({ error: 'Internal server error', details: error.message });
    }
});

// Test endpoint
app.post('/api/test', async (req, res) => {
    try {
        const { apiKey } = req.body;
        
        if (!apiKey) {
            return res.status(400).json({ error: 'API key is required' });
        }

        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: 'gpt-3.5-turbo',
                messages: [{ role: 'user', content: 'Hello' }],
                max_tokens: 5
            })
        });

        if (response.ok) {
            res.json({ success: true, message: 'API key is working correctly!' });
        } else {
            const errorData = await response.text();
            res.status(response.status).json({ 
                error: `API test failed: ${response.status}`,
                details: errorData
            });
        }
        
    } catch (error) {
        console.error('Test error:', error);
        res.status(500).json({ error: 'Test failed', details: error.message });
    }
});

// Serve the main app
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
    console.log(`🚀 Voice Journal running on http://localhost:${PORT}`);
    console.log(`📱 Frontend and API available at http://localhost:${PORT}`);
    console.log(`🔧 API endpoints: /api/chat and /api/test`);
});
