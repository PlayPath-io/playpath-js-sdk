#!/usr/bin/env node

/**
 * PlayPath SDK - Node.js CLI Example
 * 
 * A simple command-line interface demonstrating the PlayPath SDK
 * Run with: node node-cli.js
 */

const { PlayPathSDK, PlayPathError } = require('../playpath-sdk.js');
const readline = require('readline');

// Configuration - Update these values
const CONFIG = {
    baseUrl: process.env.PLAYPATH_BASE_URL || 'http://localhost:3000',
    apiKey: process.env.PLAYPATH_API_KEY || ''
};

class PlayPathCLI {
    constructor() {
        this.sdk = null;
        this.chatSession = null;
        this.rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });
    }

    async start() {
        console.log('🏉 PlayPath SDK - Node.js CLI Example');
        console.log('=====================================\n');

        // Initialize SDK
        await this.initializeSDK();

        // Show main menu
        await this.showMainMenu();
    }

    async initializeSDK() {
        if (!CONFIG.apiKey) {
            console.log('⚠️  No API key provided. You can:');
            console.log('1. Set PLAYPATH_API_KEY environment variable');
            console.log('2. Enter it manually below\n');
            
            CONFIG.apiKey = await this.ask('Enter your API key: ');
        }

        if (!CONFIG.baseUrl) {
            CONFIG.baseUrl = await this.ask('Enter base URL (default: http://localhost:3000): ') || 'http://localhost:3000';
        }

        try {
            this.sdk = new PlayPathSDK({
                baseUrl: CONFIG.baseUrl,
                apiKey: CONFIG.apiKey
            });

            console.log(`✅ Connected to: ${CONFIG.baseUrl}\n`);
        } catch (error) {
            console.error(`❌ Failed to initialize SDK: ${error.message}`);
            process.exit(1);
        }
    }

    async showMainMenu() {
        while (true) {
            console.log('\n📋 Main Menu:');
            console.log('1. Start Chat Session');
            console.log('2. Send Single Message');
            console.log('3. Manage Knowledge Base');
            console.log('4. Test API Connection');
            console.log('5. Exit\n');

            const choice = await this.ask('Choose an option (1-5): ');

            switch (choice) {
                case '1':
                    await this.startChatSession();
                    break;
                case '2':
                    await this.sendSingleMessage();
                    break;
                case '3':
                    await this.manageKnowledgeBase();
                    break;
                case '4':
                    await this.testConnection();
                    break;
                case '5':
                    console.log('👋 Goodbye!');
                    this.rl.close();
                    return;
                default:
                    console.log('❌ Invalid option. Please choose 1-5.');
            }
        }
    }

    async startChatSession() {
        console.log('\n💬 Starting Chat Session');
        console.log('========================');

        const systemPrompt = await this.ask('Enter custom system prompt (press Enter for default): ');
        this.chatSession = this.sdk.createChatSession(systemPrompt || null);

        console.log('\n🤖 Chat session started! Type "exit" to return to main menu.\n');

        while (true) {
            const message = await this.ask('You: ');

            if (message.toLowerCase() === 'exit') {
                console.log('Chat session ended.\n');
                break;
            }

            if (!message.trim()) continue;

            try {
                console.log('🤖 Assistant: Thinking...');
                const response = await this.chatSession.sendMessage(message);
                
                console.log(`🤖 Assistant: ${response.reply}\n`);

                if (response.usage !== undefined) {
                    console.log(`📊 Usage: ${response.usage}/${response.limit} (Trial account)\n`);
                }
            } catch (error) {
                console.error(`❌ Error: ${error.message}\n`);
            }
        }
    }

    async sendSingleMessage() {
        console.log('\n📝 Send Single Message');
        console.log('======================');

        const message = await this.ask('Enter your message: ');
        if (!message.trim()) {
            console.log('❌ Message cannot be empty.');
            return;
        }

        const systemPrompt = await this.ask('Enter custom system prompt (optional): ');

        try {
            console.log('🤖 Processing...');
            const params = { message };
            if (systemPrompt.trim()) {
                params.system_prompt = systemPrompt;
            }

            const response = await this.sdk.ragChat(params);
            console.log(`\n🤖 Response: ${response.reply}\n`);

            if (response.usage !== undefined) {
                console.log(`📊 Usage: ${response.usage}/${response.limit} (Trial account)\n`);
            }
        } catch (error) {
            console.error(`❌ Error: ${error.message}\n`);
        }
    }

    async manageKnowledgeBase() {
        console.log('\n📚 Knowledge Base Management');
        console.log('============================');
        console.log('1. List Items');
        console.log('2. View Item Details');
        console.log('3. Create Item');
        console.log('4. Update Item');
        console.log('5. Delete Item');
        console.log('6. Back to Main Menu\n');

        const choice = await this.ask('Choose an option (1-6): ');

        try {
            switch (choice) {
                case '1':
                    await this.listItems();
                    break;
                case '2':
                    await this.viewItemDetails();
                    break;
                case '3':
                    await this.createItem();
                    break;
                case '4':
                    await this.updateItem();
                    break;
                case '5':
                    await this.deleteItem();
                    break;
                case '6':
                    return;
                default:
                    console.log('❌ Invalid option.');
            }
        } catch (error) {
            console.error(`❌ Error: ${error.message}\n`);
        }
    }

    async listItems() {
        console.log('\n📋 Knowledge Base Items:');
        const items = await this.sdk.getItems();
        
        if (items.length === 0) {
            console.log('No items found.\n');
            return;
        }

        items.forEach((item, index) => {
            console.log(`${index + 1}. ID: ${item.id} | Title: ${item.title || 'No title'} | State: ${item.state || 'unknown'}`);
        });
        console.log('');
    }

    async viewItemDetails() {
        const id = await this.ask('Enter item ID: ');
        if (!id.trim()) return;

        const item = await this.sdk.getItem(id);
        console.log('\n📄 Item Details:');
        console.log(`ID: ${item.id}`);
        console.log(`Title: ${item.title || 'No title'}`);
        console.log(`URL: ${item.url || 'No URL'}`);
        console.log(`Text: ${item.text ? item.text.substring(0, 200) + '...' : 'No text'}`);
        console.log(`Tags: ${item.tags ? item.tags.join(', ') : 'No tags'}`);
        console.log(`State: ${item.state || 'unknown'}`);
        
        if (item.neighbors && item.neighbors.length > 0) {
            console.log('\n🔗 Similar Items:');
            item.neighbors.forEach((neighbor, index) => {
                console.log(`  ${index + 1}. ${neighbor.title || 'No title'} (ID: ${neighbor.id})`);
            });
        }
        console.log('');
    }

    async createItem() {
        console.log('\n➕ Create New Item:');
        const title = await this.ask('Title: ');
        const url = await this.ask('URL (optional): ');
        const text = await this.ask('Text content: ');
        const tagsInput = await this.ask('Tags (comma-separated, optional): ');

        const item = {
            title: title || undefined,
            url: url || undefined,
            text: text || undefined,
            tags: tagsInput ? tagsInput.split(',').map(tag => tag.trim()) : undefined
        };

        const created = await this.sdk.createItem(item);
        console.log(`✅ Item created with ID: ${created.id}\n`);
    }

    async updateItem() {
        const id = await this.ask('Enter item ID to update: ');
        if (!id.trim()) return;

        console.log('Enter new values (press Enter to keep existing):');
        const title = await this.ask('Title: ');
        const url = await this.ask('URL: ');
        const text = await this.ask('Text content: ');
        const tagsInput = await this.ask('Tags (comma-separated): ');

        const updates = {};
        if (title.trim()) updates.title = title;
        if (url.trim()) updates.url = url;
        if (text.trim()) updates.text = text;
        if (tagsInput.trim()) updates.tags = tagsInput.split(',').map(tag => tag.trim());

        if (Object.keys(updates).length === 0) {
            console.log('❌ No updates provided.\n');
            return;
        }

        const updated = await this.sdk.updateItem(id, updates);
        console.log(`✅ Item ${updated.id} updated successfully.\n`);
    }

    async deleteItem() {
        const id = await this.ask('Enter item ID to delete: ');
        if (!id.trim()) return;

        const confirm = await this.ask(`Are you sure you want to delete item ${id}? (yes/no): `);
        if (confirm.toLowerCase() !== 'yes') {
            console.log('❌ Deletion cancelled.\n');
            return;
        }

        const result = await this.sdk.deleteItem(id);
        console.log(`✅ ${result.message}\n`);
    }

    async testConnection() {
        console.log('\n🔧 Testing API Connection...');
        
        try {
            // Test RAG API
            console.log('Testing RAG API...');
            const ragResponse = await this.sdk.ragChat({
                message: 'Hello, this is a test message.'
            });
            console.log('✅ RAG API: Connected');

            // Test Items API
            console.log('Testing Items API...');
            const items = await this.sdk.getItems();
            console.log('✅ Items API: Connected');
            console.log(`📊 Found ${items.length} items in knowledge base\n`);

        } catch (error) {
            console.error(`❌ Connection test failed: ${error.message}\n`);
        }
    }

    ask(question) {
        return new Promise((resolve) => {
            this.rl.question(question, resolve);
        });
    }
}

// Start the CLI if this file is run directly
if (require.main === module) {
    const cli = new PlayPathCLI();
    cli.start().catch(error => {
        console.error('❌ Application error:', error.message);
        process.exit(1);
    });
}

module.exports = PlayPathCLI;