/**
 * PlayPath SDK - Express.js Server Example
 * 
 * A simple Express.js server that demonstrates integrating the PlayPath SDK
 * into a web application backend.
 * 
 * Install dependencies: npm install express cors
 * Run with: node express-server.js
 */

const express = require('express');
const cors = require('cors');
const { PlayPathSDK } = require('../playpath-sdk.js');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Initialize PlayPath SDK
const playPathSDK = new PlayPathSDK({
    baseUrl: process.env.PLAYPATH_BASE_URL || 'http://localhost:3000',
    apiKey: process.env.PLAYPATH_API_KEY || 'your-api-key-here'
});

// Store active chat sessions (in production, use Redis or database)
const chatSessions = new Map();

// Routes

// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'ok', service: 'PlayPath SDK Demo Server' });
});

// Start a new chat session
app.post('/api/chat/start', (req, res) => {
    const { sessionId, systemPrompt } = req.body;
    
    if (!sessionId) {
        return res.status(400).json({ error: 'sessionId is required' });
    }

    try {
        const chatSession = playPathSDK.createChatSession(systemPrompt || null);
        chatSessions.set(sessionId, chatSession);
        
        res.json({ 
            message: 'Chat session started successfully',
            sessionId: sessionId
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Send message in chat session
app.post('/api/chat/message', async (req, res) => {
    const { sessionId, message } = req.body;
    
    if (!sessionId || !message) {
        return res.status(400).json({ error: 'sessionId and message are required' });
    }

    const chatSession = chatSessions.get(sessionId);
    if (!chatSession) {
        return res.status(404).json({ error: 'Chat session not found' });
    }

    try {
        const response = await chatSession.sendMessage(message);
        res.json({
            reply: response.reply,
            usage: response.usage,
            limit: response.limit,
            sessionId: sessionId
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get chat history
app.get('/api/chat/history/:sessionId', (req, res) => {
    const { sessionId } = req.params;
    
    const chatSession = chatSessions.get(sessionId);
    if (!chatSession) {
        return res.status(404).json({ error: 'Chat session not found' });
    }

    res.json({
        history: chatSession.getHistory(),
        sessionId: sessionId
    });
});

// Clear chat history
app.delete('/api/chat/history/:sessionId', (req, res) => {
    const { sessionId } = req.params;
    
    const chatSession = chatSessions.get(sessionId);
    if (!chatSession) {
        return res.status(404).json({ error: 'Chat session not found' });
    }

    chatSession.clearHistory();
    res.json({ message: 'Chat history cleared' });
});

// End chat session
app.delete('/api/chat/:sessionId', (req, res) => {
    const { sessionId } = req.params;
    
    if (chatSessions.has(sessionId)) {
        chatSessions.delete(sessionId);
        res.json({ message: 'Chat session ended' });
    } else {
        res.status(404).json({ error: 'Chat session not found' });
    }
});

// Direct RAG API proxy (for one-off messages)
app.post('/api/rag/chat', async (req, res) => {
    try {
        const response = await playPathSDK.ragChat(req.body);
        res.json(response);
    } catch (error) {
        res.status(error.status || 500).json({ 
            error: error.message,
            details: error.data 
        });
    }
});

// Knowledge base routes

// Get all items
app.get('/api/items', async (req, res) => {
    try {
        const items = await playPathSDK.getItems();
        res.json(items);
    } catch (error) {
        res.status(error.status || 500).json({ error: error.message });
    }
});

// Get specific item
app.get('/api/items/:id', async (req, res) => {
    try {
        const item = await playPathSDK.getItem(req.params.id);
        res.json(item);
    } catch (error) {
        res.status(error.status || 500).json({ error: error.message });
    }
});

// Create new item
app.post('/api/items', async (req, res) => {
    try {
        const item = await playPathSDK.createItem(req.body);
        res.status(201).json(item);
    } catch (error) {
        res.status(error.status || 500).json({ error: error.message });
    }
});

// Update item
app.put('/api/items/:id', async (req, res) => {
    try {
        const item = await playPathSDK.updateItem(req.params.id, req.body);
        res.json(item);
    } catch (error) {
        res.status(error.status || 500).json({ error: error.message });
    }
});

// Delete item
app.delete('/api/items/:id', async (req, res) => {
    try {
        const result = await playPathSDK.deleteItem(req.params.id);
        res.json(result);
    } catch (error) {
        res.status(error.status || 500).json({ error: error.message });
    }
});

// Serve a simple frontend
app.get('/', (req, res) => {
    res.send(`
<!DOCTYPE html>
<html>
<head>
    <title>PlayPath SDK Demo Server</title>
    <style>
        body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
        .endpoint { background: #f5f5f5; padding: 10px; margin: 10px 0; border-radius: 5px; }
        .method { font-weight: bold; color: #007bff; }
    </style>
</head>
<body>
    <h1>🏉 PlayPath SDK Demo Server</h1>
    <p>This Express.js server demonstrates how to integrate the PlayPath SDK into a web application backend.</p>
    
    <h2>Available Endpoints</h2>
    
    <h3>Chat Session Management</h3>
    <div class="endpoint">
        <span class="method">POST</span> /api/chat/start - Start new chat session
    </div>
    <div class="endpoint">
        <span class="method">POST</span> /api/chat/message - Send message in session
    </div>
    <div class="endpoint">
        <span class="method">GET</span> /api/chat/history/:sessionId - Get chat history
    </div>
    <div class="endpoint">
        <span class="method">DELETE</span> /api/chat/history/:sessionId - Clear chat history
    </div>
    <div class="endpoint">
        <span class="method">DELETE</span> /api/chat/:sessionId - End chat session
    </div>
    
    <h3>Direct RAG API</h3>
    <div class="endpoint">
        <span class="method">POST</span> /api/rag/chat - Send direct message to RAG API
    </div>
    
    <h3>Knowledge Base</h3>
    <div class="endpoint">
        <span class="method">GET</span> /api/items - Get all items
    </div>
    <div class="endpoint">
        <span class="method">GET</span> /api/items/:id - Get specific item
    </div>
    <div class="endpoint">
        <span class="method">POST</span> /api/items - Create new item
    </div>
    <div class="endpoint">
        <span class="method">PUT</span> /api/items/:id - Update item
    </div>
    <div class="endpoint">
        <span class="method">DELETE</span> /api/items/:id - Delete item
    </div>
    
    <h2>Usage Examples</h2>
    <p>Try these curl commands:</p>
    <pre>
# Start chat session
curl -X POST http://localhost:${PORT}/api/chat/start \\
  -H "Content-Type: application/json" \\
  -d '{"sessionId": "test-session", "systemPrompt": "You are a rugby coach"}'

# Send message
curl -X POST http://localhost:${PORT}/api/chat/message \\
  -H "Content-Type: application/json" \\
  -d '{"sessionId": "test-session", "message": "What is a scrum?"}'

# Get items
curl http://localhost:${PORT}/api/items
    </pre>
    
    <p><strong>Note:</strong> Make sure to set your PLAYPATH_BASE_URL and PLAYPATH_API_KEY environment variables.</p>
</body>
</html>
    `);
});

// Error handling middleware
app.use((error, req, res, next) => {
    console.error('Server error:', error);
    res.status(500).json({ 
        error: 'Internal server error',
        message: error.message 
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 PlayPath SDK Demo Server running on http://localhost:${PORT}`);
    console.log(`📖 API documentation available at http://localhost:${PORT}`);
    console.log(`\n📋 Configuration:`);
    console.log(`   PlayPath URL: ${process.env.PLAYPATH_BASE_URL || 'http://localhost:3000'}`);
    console.log(`   API Key: ${process.env.PLAYPATH_API_KEY ? 'Set' : 'Not set (using default)'}`);
    console.log(`\n💡 Set environment variables:`);
    console.log(`   export PLAYPATH_BASE_URL=https://playpath.io`);
    console.log(`   export PLAYPATH_API_KEY=your-api-key-here`);
});

module.exports = app;