# PlayPath SDK Examples

This directory contains practical examples demonstrating how to use the PlayPath SDK in different environments and scenarios.

## Examples Overview

### 1. 📱 Browser Chat Interface (`browser-chat.html`)
A complete, interactive web-based chat interface that demonstrates:
- SDK initialization and configuration
- Real-time chat with the RAG API
- Custom system prompts
- Error handling and user feedback
- Usage tracking for trial accounts

**How to use:**
1. Open `browser-chat.html` in a web browser
2. Configure your PlayPath instance URL and API key
3. Start chatting with the rugby coaching assistant

### 2. 💻 Command Line Interface (`node-cli.js`)
A full-featured CLI application with menu-driven interface for:
- Interactive chat sessions
- Knowledge base management (CRUD operations)
- API connection testing
- Single message queries

**How to use:**
```bash
# Set environment variables (optional)
export PLAYPATH_BASE_URL=https://your-instance.com
export PLAYPATH_API_KEY=your-api-key

# Run the CLI
node node-cli.js
```

### 3. 🚀 Simple Example (`simple-example.js`)
Basic usage demonstration showing:
- Simple chat messages
- Custom system prompts
- Chat sessions with history
- Knowledge base operations

**How to use:**
```bash
# Edit the file to add your API details
node simple-example.js
```

### 4. 🌐 Express.js Server (`express-server.js`)
Backend server implementation demonstrating:
- REST API endpoints
- Chat session management
- Knowledge base proxy
- Error handling middleware

**How to use:**
```bash
# Install dependencies
npm install express cors

# Set environment variables
export PLAYPATH_BASE_URL=https://your-instance.com
export PLAYPATH_API_KEY=your-api-key

# Start server
node express-server.js

# Visit http://localhost:3001 for API documentation
```

## Quick Start

1. **Choose your environment**: Browser, Node.js CLI, or backend server
2. **Configure credentials**: Set your PlayPath instance URL and API key
3. **Run the example**: Follow the specific instructions for each example
4. **Explore features**: Each example demonstrates different SDK capabilities

## Configuration

All examples support these configuration methods:

### Environment Variables
```bash
export PLAYPATH_BASE_URL=https://playpath.io
export PLAYPATH_API_KEY=your-api-key-here
```

### Direct Configuration
```javascript
const sdk = new PlayPathSDK({
    baseUrl: 'https://your-instance.com',
    apiKey: 'your-api-key'
});
```

## Features Demonstrated

- ✅ **RAG Chat API** - Intelligent responses using knowledge base
- ✅ **Optional Parameters** - History and custom system prompts  
- ✅ **Chat Sessions** - Automatic conversation history management
- ✅ **Items API** - Full CRUD operations on knowledge base
- ✅ **Error Handling** - Robust error management and user feedback
- ✅ **Authentication** - API key authentication
- ✅ **Usage Tracking** - Trial account usage monitoring
- ✅ **Cross-Platform** - Browser and Node.js support

## API Endpoints Used

### RAG API
- `POST /api/rag/chat` - Send messages to the coaching assistant

### Items API
- `GET /api/items` - List all knowledge base items
- `GET /api/items/:id` - Get specific item with neighbors
- `POST /api/items` - Create new knowledge base item
- `PUT /api/items/:id` - Update existing item
- `DELETE /api/items/:id` - Delete item

## Troubleshooting

### Common Issues

1. **API Key Authentication**
   - Ensure your API key is valid and has proper permissions
   - Check that you're using the correct endpoint URL

2. **CORS Issues (Browser)**
   - Make sure your PlayPath instance allows requests from your domain
   - For local development, use the browser example from the same origin

3. **Network Errors**
   - Verify the PlayPath instance is accessible
   - Check firewall and network connectivity

4. **Trial Limits**
   - Monitor usage counters in the response
   - Upgrade to a paid plan if needed

### Getting Help

- Check the main SDK documentation in `../README.md`
- Review your PlayPath instance documentation at `/docs`
- Verify API endpoints are working with tools like curl or Postman

## Next Steps

After exploring these examples:
1. Integrate the SDK into your own application
2. Customize the system prompts for your specific use case
3. Build your own knowledge base with relevant content
4. Implement user authentication and session management
5. Add advanced features like conversation analytics

Happy coding! 🏉