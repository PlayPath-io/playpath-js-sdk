# PlayPath JavaScript SDK

A JavaScript library for interacting with the PlayPath RAG (Retrieval-Augmented Generation) and Items APIs. This SDK provides an easy-to-use interface for building coaching assistants, knowledge management systems, and other applications powered by PlayPath.

## Features

- 🤖 **RAG Chat API**: Interact with the intelligent sports coaching assistant
- 📚 **Items API**: Manage knowledge base items (CRUD operations)
- 🔄 **Chat Sessions**: Built-in chat history management
- 🔐 **Authentication**: API key support
- 🌐 **Universal**: Works in both browser and Node.js environments
- 📝 **TypeScript**: Full TypeScript definitions included
- ⚡ **Lightweight**: No external dependencies

## Installation

### Browser (CDN)

```html
<script src="path/to/playpath-sdk.js"></script>
<script>
  const sdk = new PlayPathSDK({
    baseUrl: 'https://playpath.io',
    apiKey: 'your-api-key'
  });
</script>
```

### Node.js

```bash
# Copy the SDK files to your project
cp -r js-sdk/ ./playpath-sdk/
```

```javascript
const { PlayPathSDK } = require('./playpath-sdk/playpath-sdk.js');

const sdk = new PlayPathSDK({
  baseUrl: 'https://playpath.io',
  apiKey: 'your-api-key'
});
```

### ES Modules

```javascript
import { PlayPathSDK } from './playpath-sdk.js';

const sdk = new PlayPathSDK({
  baseUrl: 'https://playpath.io',
  apiKey: 'your-api-key'
});
```

## Quick Start

### Basic RAG Chat

```javascript
const sdk = new PlayPathSDK({
  baseUrl: 'https://playpath.io',
  apiKey: 'your-api-key'
});

// Simple chat
const response = await sdk.ragChat({
  message: "What's the best tackling technique in rugby?"
});

console.log(response.reply);
```

### Chat with History

```javascript
// Chat with conversation history
const response = await sdk.ragChat({
  message: "Can you elaborate on that?",
  history: [
    { role: 'user', text: "What's the best tackling technique?" },
    { role: 'assistant', text: "The best tackling technique involves..." }
  ]
});
```

### Custom System Prompt

```javascript
// Use custom system prompt
const response = await sdk.ragChat({
  message: "Explain defensive strategies",
  system_prompt: "You are a specialized rugby defense coach. Focus on advanced tactics."
});
```

### Chat Sessions (Recommended)

```javascript
// Create a chat session with automatic history management
const chatSession = sdk.createChatSession(
  "You are a specialized rugby coach focused on forwards play."
);

// Send messages - history is managed automatically
const response1 = await chatSession.sendMessage("What are the key scrum techniques?");
const response2 = await chatSession.sendMessage("How about lineout throwing?");

// Get chat history
const history = chatSession.getHistory();
console.log(history);
```

## API Reference

### Constructor

```javascript
const sdk = new PlayPathSDK(config)
```

**Parameters:**
- `config.baseUrl` (string): Base URL of your PlayPath instance
- `config.apiKey` (string): Your API key for authentication
- `config.headers` (object): Additional headers to include in requests

### RAG API

#### `ragChat(params)`

Send a message to the RAG chat assistant.

```javascript
const response = await sdk.ragChat({
  message: "Your question here",           // Required
  history: [...],                          // Optional: chat history
  system_prompt: "Custom instructions"     // Optional: system prompt
});
```

**Response:**
```javascript
{
  reply: "Assistant's response",
  usage: 15,    // Current usage count (for trial users)
  limit: 20     // Usage limit (for trial users)
}
```

### Items API

#### `getItems()`

Get all items from the knowledge base.

```javascript
const items = await sdk.getItems();
```

#### `getItem(id)`

Get a specific item with similar neighbors.

```javascript
const item = await sdk.getItem('123');
// Returns: { id, title, url, text, tags, neighbors: [...] }
```

#### `createItem(item)`

Create a new knowledge base item.

```javascript
const newItem = await sdk.createItem({
  title: "Tackling Fundamentals",
  url: "https://example.com/tackling",
  text: "Key points about tackling...",
  tags: ["tackling", "defense", "fundamentals"]
});
```

#### `updateItem(id, item)`

Update an existing item.

```javascript
const updatedItem = await sdk.updateItem('123', {
  title: "Updated title",
  text: "Updated content..."
});
```

#### `deleteItem(id)`

Delete an item.

```javascript
const result = await sdk.deleteItem('123');
// Returns: { message: "Item deleted successfully" }
```

### Chat Sessions

#### `createChatSession(systemPrompt)`

Create a chat session with automatic history management.

```javascript
const session = sdk.createChatSession("You are a rugby coach");

// Send messages
await session.sendMessage("Hello");

// Get history
const history = session.getHistory();

// Clear history
session.clearHistory();

// Change system prompt
session.setSystemPrompt("New instructions");
```

### Utility Methods

#### `formatChatHistory(messages)`

Format messages for the RAG API.

```javascript
const formatted = sdk.formatChatHistory([
  { content: "Hello", role: "user" },
  { message: "Hi there", role: "assistant" }
]);
// Returns: [{ text: "Hello", role: "user" }, { text: "Hi there", role: "assistant" }]
```

### Configuration Methods

#### `setApiKey(apiKey)`

Set or update the API key.

```javascript
sdk.setApiKey('new-api-key');
```

#### `setBaseUrl(baseUrl)`

Set or update the base URL.

```javascript
sdk.setBaseUrl('https://new-instance.com');
```

## Error Handling

The SDK throws `PlayPathError` for API errors:

```javascript
try {
  const response = await sdk.ragChat({ message: "" });
} catch (error) {
  if (error instanceof PlayPathError) {
    console.log('Error:', error.message);
    console.log('Status:', error.status);
    console.log('Data:', error.data);
  }
}
```

## Examples

### Building a Chat Interface

```javascript
// Initialize SDK
const sdk = new PlayPathSDK({
  baseUrl: 'https://playpath.io',
  apiKey: 'your-api-key'
});

// Create chat session
const chatSession = sdk.createChatSession();

// Handle user input
async function handleUserMessage(userMessage) {
  try {
    const response = await chatSession.sendMessage(userMessage);
    displayMessage('assistant', response.reply);
    
    // Show usage info for trial users
    if (response.usage !== undefined) {
      console.log(`Usage: ${response.usage}/${response.limit}`);
    }
  } catch (error) {
    console.error('Chat error:', error.message);
    displayMessage('system', 'Sorry, there was an error processing your message.');
  }
}

function displayMessage(role, text) {
  // Your UI code here
  console.log(`${role}: ${text}`);
}
```

### Knowledge Base Management

```javascript
// Add content to knowledge base
async function addKnowledgeItem(title, content, url = null) {
  try {
    const item = await sdk.createItem({
      title: title,
      text: content,
      url: url,
      tags: extractTags(content)
    });
    console.log('Added item:', item.id);
    return item;
  } catch (error) {
    console.error('Failed to add item:', error.message);
  }
}

// Search and display similar items
async function showSimilarContent(itemId) {
  try {
    const item = await sdk.getItem(itemId);
    console.log('Similar items:', item.neighbors);
  } catch (error) {
    console.error('Failed to get item:', error.message);
  }
}

function extractTags(content) {
  // Simple tag extraction logic
  const words = content.toLowerCase().match(/\b\w+\b/g) || [];
  return [...new Set(words)].slice(0, 5); // First 5 unique words as tags
}
```

## TypeScript Support

The SDK includes full TypeScript definitions:

```typescript
import { PlayPathSDK, RagChatParams, Item } from './playpath-sdk';

const sdk = new PlayPathSDK({
  baseUrl: 'https://your-instance.com',
  apiKey: 'your-key'
});

const params: RagChatParams = {
  message: "Hello",
  history: [{ role: 'user', text: 'Previous message' }]
};

const response = await sdk.ragChat(params);
```

## Environment Support

- **Browser**: Modern browsers with fetch support
- **Node.js**: Version 14.0.0 or higher
- **TypeScript**: Full type definitions included

## License

MIT License - see LICENSE file for details.

## Support

For issues and questions:
- Check the API documentation at `/docs` on your PlayPath instance
- Review the examples in this repository
- Contact your PlayPath administrator