/**
 * PlayPath SDK - JavaScript library for interacting with PlayPath RAG and Items APIs
 * Supports both browser and Node.js environments
 */

class PlayPathSDK {
  /**
   * Initialize the PlayPath SDK
   * @param {Object} config - Configuration object
   * @param {string} config.baseUrl - Base URL of the PlayPath API
   * @param {string} config.apiKey - API key for authentication
   * @param {Object} [config.headers] - Additional headers to include in requests
   */
  constructor(config = {}) {
    this.baseUrl = config.baseUrl || '';
    this.apiKey = config.apiKey || '';
    this.headers = {
      'Content-Type': 'application/json',
      ...config.headers
    };
    
    if (this.apiKey) {
      this.headers['X-Api-Key'] = this.apiKey;
    }
  }

  /**
   * Set API key for authentication
   * @param {string} apiKey - The API key
   */
  setApiKey(apiKey) {
    this.apiKey = apiKey;
    this.headers['X-Api-Key'] = apiKey;
  }

  /**
   * Set base URL for the API
   * @param {string} baseUrl - The base URL
   */
  setBaseUrl(baseUrl) {
    this.baseUrl = baseUrl;
  }

  /**
   * Make HTTP request
   * @private
   */
  async _request(endpoint, options = {}) {
    const url = `${this.baseUrl}${endpoint}`;
    const config = {
      headers: { ...this.headers, ...options.headers },
      ...options
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new PlayPathError(
          data.error || `HTTP ${response.status}`,
          response.status,
          data
        );
      }

      return data;
    } catch (error) {
      if (error instanceof PlayPathError) {
        throw error;
      }
      throw new PlayPathError(error.message, null, error);
    }
  }

  /**
   * RAG API Methods
   */

  /**
   * Send a chat message to the RAG API
   * @param {Object} params - Chat parameters
   * @param {string} params.message - The message to send (required)
   * @param {Array} [params.history] - Chat history array
   * @param {string} [params.system_prompt] - Custom system prompt
   * @returns {Promise<Object>} Chat response
   */
  async ragChat(params) {
    if (!params.message) {
      throw new PlayPathError('Message is required', 400);
    }

    const payload = {
      message: params.message
    };

    if (params.history) {
      payload.history = params.history;
    }

    if (params.system_prompt) {
      payload.system_prompt = params.system_prompt;
    }

    return this._request('/api/rag/chat', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  }

  /**
   * Items API Methods
   */

  /**
   * Get all items
   * @returns {Promise<Array>} Array of items
   */
  async getItems() {
    return this._request('/api/items');
  }

  /**
   * Get a specific item by ID
   * @param {string|number} id - Item ID
   * @returns {Promise<Object>} Item object with neighbors
   */
  async getItem(id) {
    return this._request(`/api/items/${id}`);
  }

  /**
   * Create a new item
   * @param {Object} item - Item data
   * @param {string} item.title - Item title
   * @param {string} [item.url] - Item URL
   * @param {string} [item.text] - Item text content
   * @param {Array} [item.tags] - Item tags
   * @returns {Promise<Object>} Created item
   */
  async createItem(item) {
    if (!item.title && !item.text) {
      throw new PlayPathError('Either title or text is required', 400);
    }

    return this._request('/api/items', {
      method: 'POST',
      body: JSON.stringify(item)
    });
  }

  /**
   * Update an existing item
   * @param {string|number} id - Item ID
   * @param {Object} item - Updated item data
   * @returns {Promise<Object>} Updated item
   */
  async updateItem(id, item) {
    return this._request(`/api/items/${id}`, {
      method: 'PUT',
      body: JSON.stringify(item)
    });
  }

  /**
   * Delete an item
   * @param {string|number} id - Item ID
   * @returns {Promise<Object>} Delete confirmation
   */
  async deleteItem(id) {
    return this._request(`/api/items/${id}`, {
      method: 'DELETE'
    });
  }

  /**
   * Utility Methods
   */

  /**
   * Format chat history for RAG API
   * @param {Array} messages - Array of message objects
   * @returns {Array} Formatted history
   */
  formatChatHistory(messages) {
    return messages.map(msg => ({
      role: msg.role || 'user',
      text: msg.text || msg.message || msg.content || ''
    }));
  }

  /**
   * Create a chat session helper
   * @param {string} [systemPrompt] - System prompt for the session
   * @returns {Object} Chat session object
   */
  createChatSession(systemPrompt = null) {
    const history = [];
    
    return {
      /**
       * Send a message in this chat session
       * @param {string} message - The message to send
       * @returns {Promise<Object>} Response from RAG API
       */
      sendMessage: async (message) => {
        const params = {
          message,
          history: [...history]
        };
        
        if (systemPrompt) {
          params.system_prompt = systemPrompt;
        }
        
        const response = await this.ragChat(params);
        
        // Add to history
        history.push({ role: 'user', text: message });
        history.push({ role: 'assistant', text: response.reply });
        
        return response;
      },
      
      /**
       * Get current chat history
       * @returns {Array} Chat history
       */
      getHistory: () => [...history],
      
      /**
       * Clear chat history
       */
      clearHistory: () => {
        history.length = 0;
      },
      
      /**
       * Set system prompt
       * @param {string} prompt - New system prompt
       */
      setSystemPrompt: (prompt) => {
        systemPrompt = prompt;
      }
    };
  }
}

/**
 * Custom error class for PlayPath SDK
 */
class PlayPathError extends Error {
  constructor(message, status = null, data = null) {
    super(message);
    this.name = 'PlayPathError';
    this.status = status;
    this.data = data;
  }
}

// Export for different environments
if (typeof module !== 'undefined' && module.exports) {
  // Node.js
  module.exports = { PlayPathSDK, PlayPathError };
} else if (typeof window !== 'undefined') {
  // Browser
  window.PlayPathSDK = PlayPathSDK;
  window.PlayPathError = PlayPathError;
}