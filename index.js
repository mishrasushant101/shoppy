const express = require('express');
const path = require('path');
const app = express();
const port = 3000;

app.use(express.static('public'));
app.use(express.json());

const apiKey = 'kTOqhkWcn956cMf7s1HYG780u4XgYNuZ';

// Function to create a chat session
async function createChatSession(apiKey, externalUserId) {
    const response = await fetch('https://api.on-demand.io/chat/v1/sessions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'apikey': apiKey
        },
        body: JSON.stringify({
            pluginIds: [],
            externalUserId: externalUserId
        })
    });

    const data = await response.json();
    return data.data.id; // Extract session ID
}

// Function to submit a query using the session ID
async function submitQuery(apiKey, sessionId, query) {
    const response = await fetch(`https://api.on-demand.io/chat/v1/sessions/${sessionId}/query`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'apikey': apiKey
        },
        body: JSON.stringify({
            endpointId: 'predefined-openai-gpt4o',
            query: query,
            pluginIds: [
                'plugin-1712327325',
                'plugin-1713962163',
                'plugin-1716334779',
                'plugin-1716119225'
            ],
            responseMode: 'sync'
        })
    });

    const data = await response.json();
    return data;
}

app.post('/chat', async (req, res) => {
    const { message, userId } = req.body;
    
    console.log('Received request:', { message, userId }); // Debug log
    
    try {
        const sessionId = await createChatSession(apiKey, userId || 'default-user');
        console.log('Created session:', sessionId); // Debug log
        
        const response = await submitQuery(apiKey, sessionId, message);
        console.log('API response:', response); // Debug log
        
        res.json(response);
    } catch (error) {
        console.error('Error details:', error); // More detailed error logging
        res.status(500).json({ error: 'Internal server error', details: error.message });
    }
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});